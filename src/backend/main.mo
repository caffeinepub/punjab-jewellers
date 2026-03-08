import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    description : Text;
    tags : [Text];
    isActive : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Inquiry = {
    name : Text;
    phone : Text;
    productInterest : Text;
    message : Text;
    timestamp : Time.Time;
  };

  module Inquiry {
    public func compare(i1 : Inquiry, i2 : Inquiry) : Order.Order {
      Int.compare(i1.timestamp, i2.timestamp);
    };
  };

  type GoldPrice = {
    purity : Text;
    pricePerGram : Nat;
    lastUpdated : Time.Time;
  };

  module GoldPrice {
    public func compare(gp1 : GoldPrice, gp2 : GoldPrice) : Order.Order {
      switch (Text.compare(gp1.purity, gp2.purity)) {
        case (#equal) { Int.compare(gp1.lastUpdated, gp2.lastUpdated) };
        case (order) { order };
      };
    };
  };

  var nextProductId = 7;

  let products = Map.fromArray<Nat, Product>([
    (1, {
      id = 1;
      name = "Bridal Gold Necklace";
      category = "Necklaces";
      price = 150_000;
      description = "Exquisite bridal gold necklace with traditional Punjabi design. Approximately 50 grams of 22K gold.";
      tags = ["bestseller", "bridal"];
      isActive = true;
    }),
    (2, {
      id = 2;
      name = "Diamond Solitaire Ring";
      category = "Rings";
      price = 350_000;
      description = "Elegant 18K white gold ring with SI-certified diamond solitaire.";
      tags = ["engagement", "diamond"];
      isActive = true;
    }),
    (3, {
      id = 3;
      name = "Complete Bridal Set";
      category = "Bridal";
      price = 450_000;
      description = "Luxury bridal set including necklace, earrings, and headpiece with 22K gold and gemstone accents.";
      tags = ["wedding", "premium"];
      isActive = true;
    }),
    (4, {
      id = 4;
      name = "Gold Kara Bangle";
      category = "Bangles";
      price = 35_000;
      description = "Classic Punjabi kara style bangle, 25 grams 22K gold.";
      tags = ["bestseller"];
      isActive = true;
    }),
    (5, {
      id = 5;
      name = "Jhumka Earrings";
      category = "Earrings";
      price = 22_000;
      description = "Traditional Punjabi jhumka style earrings in 22K gold.";
      tags = ["trending"];
      isActive = true;
    }),
    (6, {
      id = 6;
      name = "Wedding Gold Set";
      category = "Wedding Sets";
      price = 200_000;
      description = "Complete wedding gold set with choker, earrings, and bracelets. Approximately 75 grams of 22K gold.";
      tags = ["wedding", "exclusive"];
      isActive = true;
    }),
  ]);

  let inquiries = Map.empty<Text, Inquiry>();
  let goldPrices = Map.empty<Text, GoldPrice>();

  public shared ({ caller }) func submitInquiry(name : Text, phone : Text, productInterest : Text, message : Text) : async () {
    let inquiry : Inquiry = {
      name;
      phone;
      productInterest;
      message;
      timestamp = Time.now();
    };
    inquiries.add(phone, inquiry);
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    inquiries.values().toArray().sort();
  };

  public query ({ caller }) func getActiveProducts() : async [Product] {
    let filteredIter = products.values().filter(func(p) { p.isActive });
    filteredIter.toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    let filteredIter = products.values().filter(func(p) { p.category == category and p.isActive });
    filteredIter.toArray();
  };

  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Nat, description : Text, tags : [Text]) : async () {
    let product : Product = {
      id = nextProductId;
      name;
      category;
      price;
      description;
      tags;
      isActive = true;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateGoldPrice(purity : Text, pricePerGram : Nat) : async () {
    let goldPrice : GoldPrice = {
      purity;
      pricePerGram;
      lastUpdated = Time.now();
    };
    goldPrices.add(purity, goldPrice);
  };

  public query ({ caller }) func getGoldPrices() : async [GoldPrice] {
    goldPrices.values().toArray().sort();
  };
};
