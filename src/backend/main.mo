import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";


// Use migration module for upgrade

actor {
  include MixinStorage();

  // Types
  public type UsageStats = {
    totalAppOpenCount : Nat;
    uniqueUserEstimate : Nat;
    recentAppOpenEvents : [Time.Time];
  };

  public type MarketCategory = {
    #productivity;
    #finance;
    #education;
    #health;
    #entertainment;
    #utility;
    #business;
    #other;
  };

  public type PayoutCurrency = {
    #usdc;
    #btc;
    #icp;
  };

  public type MarketConfig = {
    priceUSD : Nat;
    description : Text;
    category : MarketCategory;
    walletPrincipal : ?Principal;
    payoutCurrency : PayoutCurrency;
    isPublished : Bool;
    totalRoyaltiesEarned : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    stripeCustomerId : ?Text;
    encryptedExtraSomething : ?Blob;
  };

  public type SubscriptionStatus = {
    #free;
    #proMonthly;
    #proAnnual;
  };

  public type SubscriptionUpdate = {
    status : SubscriptionStatus;
    stripeSubscriptionId : ?Text;
    expiresAt : ?Int;
  };

  public type UserUsageStats = {
    dailyScans : Nat;
    lastResetTime : Int;
  };

  public type BanRecord = {
    reason : Text;
    timestamp : Time.Time;
    permanent : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Market config state
  var marketConfig : MarketConfig = {
    priceUSD = 0;
    description = "";
    category = #other;
    walletPrincipal = null;
    payoutCurrency = #usdc;
    isPublished = false;
    totalRoyaltiesEarned = 0;
  };

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var totalAppOpenCount = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSubscriptions = Map.empty<Principal, SubscriptionUpdate>();
  let userUsageStats = Map.empty<Principal, UserUsageStats>();
  let products = Map.empty<Text, { id : Text; name : Text; priceId : Text; description : Text }>();
  let uniqueUserCheck = Map.empty<Principal, ()>();
  let usageEvents = List.empty<Time.Time>();
  let punches = Map.empty<Text, {
    id : Text;
    userId : Principal;
    content : Text;
    timestamp : Int;
    views : Nat;
    likes : Nat;
  }>();
  let punchLikes = Map.empty<Text, Map.Map<Principal, ()>>();
  let chatMessages = Map.empty<Text, {
    id : Text;
    senderId : Principal;
    receiverId : Principal;
    content : Text;
    timestamp : Int;
    isRead : Bool;
    mediaBlobId : ?Text;
  }>();
  let userOnlineStatus = Map.empty<Principal, Bool>();
  let therapistSessions = Map.empty<Text, {
    id : Text;
    therapistId : Principal;
    clientId : Principal;
    notes : Text;
    resolutionTips : Text;
    timestamp : Int;
    isActive : Bool;
  }>();

  // bannedPrincipal Key : principal, value: { reason; timestamp = currentTime; permanent = true }
  let bannedPrincipals = Map.empty<Principal, BanRecord>();

  // Stripe integration
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func enforceNotBannedUser(caller : Principal) : () {
    switch (bannedPrincipals.get(caller)) {
      case (?_record) {
        Runtime.trap("The Dragon caught you stealing. Account permanently removed.");
      };
      case (null) { () };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    enforceNotBannedUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own information in secure state");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("You must be authenticated to update your profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerSubscription() : async ?SubscriptionUpdate {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their subscription");
    };
    userSubscriptions.get(caller);
  };

  public shared ({ caller }) func updateCallerSubscription(subscription : SubscriptionUpdate) : async () {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their subscription");
    };
    userSubscriptions.add(caller, subscription);
  };

  public query ({ caller }) func getCallerUsageStats() : async ?UserUsageStats {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their usage stats");
    };
    userUsageStats.get(caller);
  };

  public shared ({ caller }) func incrementDailyScans() : async () {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment scans");
    };

    let now = Time.now();
    let oneDayNanos = 24 * 60 * 60 * 1_000_000_000;

    switch (userUsageStats.get(caller)) {
      case (null) {
        userUsageStats.add(
          caller,
          {
            dailyScans = 1;
            lastResetTime = now;
          },
        );
      };
      case (?stats) {
        if ((now - stats.lastResetTime : Int) >= oneDayNanos) {
          userUsageStats.add(
            caller,
            {
              dailyScans = 1;
              lastResetTime = now;
            },
          );
        } else {
          userUsageStats.add(
            caller,
            {
              dailyScans = stats.dailyScans + 1;
              lastResetTime = stats.lastResetTime;
            },
          );
        };
      };
    };
  };

  public shared ({ caller }) func resetFreeTierUsage() : async () {
    enforceNotBannedUser(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset free tier usage");
    };

    let now = Time.now();
    for ((principal, subscription) in userSubscriptions.entries()) {
      switch (subscription.status) {
        case (#free) {
          userUsageStats.add(
            principal,
            {
              dailyScans = 0;
              lastResetTime = now;
            },
          );
        };
        case (_) {};
      };
    };
  };

  public query func getProducts() : async [{ id : Text; name : Text; priceId : Text; description : Text }] {
    products.values().toArray();
  };

  public query func authenticateUser(authToken : Text) : async Bool {
    authToken.size() > 0;
  };

  public shared ({ caller }) func trackAppOpen() : async () {
    enforceNotBannedUser(caller);

    totalAppOpenCount += 1;

    if (caller.isAnonymous()) {
      return;
    };

    let isNewUser = not uniqueUserCheck.containsKey(caller);
    if (isNewUser) {
      uniqueUserCheck.add(caller, ());
    };

    let now = Time.now();
    usageEvents.add(now);

    let maxEvents = 500;
    let currentSize = usageEvents.size();
    if (currentSize > maxEvents) {
      let dropCount = currentSize - maxEvents;
      let dropped = usageEvents.values().drop(dropCount);
      usageEvents.clear();
      for (event in dropped) {
        usageEvents.add(event);
      };
    };
  };

  func comparePunches(a : {
    id : Text;
    userId : Principal;
    content : Text;
    timestamp : Int;
    views : Nat;
    likes : Nat;
  }, b : {
    id : Text;
    userId : Principal;
    content : Text;
    timestamp : Int;
    views : Nat;
    likes : Nat;
  }) : Order.Order {
    let aScore = a.views + (a.likes * 2);
    let bScore = b.views + (b.likes * 2);

    if (aScore > bScore) {
      #less;
    } else if (aScore < bScore) {
      #greater;
    } else {
      if (a.timestamp > b.timestamp) {
        #less;
      } else if (a.timestamp < b.timestamp) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Admin-only: ban any principal with a given reason
  public shared ({ caller }) func banUser(principal : Principal, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    let currentTime = Time.now();
    let banRecord : BanRecord = {
      reason;
      timestamp = currentTime;
      permanent = true;
    };

    bannedPrincipals.add(principal, banRecord);
  };

  // Authenticated users only: self-report media theft ban (called by the frontend MediaProtection component).
  // Requires the caller to be a fully authenticated user (not anonymous/guest) so the ban is
  // tied to a real Internet Identity principal.
  public shared ({ caller }) func banUserForMediaTheft(reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to record a media theft ban");
    };

    let currentTime = Time.now();
    let banRecord : BanRecord = {
      reason;
      timestamp = currentTime;
      permanent = true;
    };
    bannedPrincipals.add(caller, banRecord);
  };

  // Public query — no auth required; the frontend needs to check ban status before allowing uploads
  public query func isBanned(principal : Principal) : async Bool {
    bannedPrincipals.containsKey(principal);
  };

  // Only the principal themselves or an admin may inspect the full ban record
  public query ({ caller }) func getBanStatus(principal : Principal) : async ?BanRecord {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins or the user itself can check ban status");
    };
    bannedPrincipals.get(principal);
  };

  // Admin-only: lift a ban
  public shared ({ caller }) func unbanUser(principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bannedPrincipals.remove(principal);
  };
};
