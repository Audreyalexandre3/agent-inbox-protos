// Fake data for the Agent Inbox prototypes. Brand: Halden & Co (home fragrance, DTC, Shopify).
(function () {
  const BRAND = { name: "Halden & Co", site: "halden.co" };

  const AGENTS = [
    { id: "lead", name: "Lead agent", short: "Lead", dot: "#e8590c",
      role: "Spots buying intent and answers with the right product.",
      acts: ["reply"], source: "Product catalog from halden.co/shop",
      guide: "Answer buying questions in one or two short lines. Send the product link by DM, never in public. Mention the Black Friday code only for Discovery sets." },
    { id: "support", name: "Support agent", short: "Support", dot: "#1c7ed6",
      role: "Answers customer questions from your website.",
      acts: ["reply"], source: "halden.co/faq, /shipping, /returns",
      guide: "Use the FAQ, shipping and returns pages only. If the answer is not there, ask me. Order problems go to DM." },
    { id: "engage", name: "Engagement agent", short: "Engagement", dot: "#2f9e44",
      role: "Likes and thanks happy customers.",
      acts: ["like"], source: "Brand voice",
      guide: "Like every positive comment. Suggest a reply only when someone tells a story or tags a friend. One emoji max." },
    { id: "mod", name: "Moderation agent", short: "Moderation", dot: "#7950f2",
      role: "Hides spam, scams and insults.",
      acts: ["hide"], source: "Moderation rules",
      guide: "Hide spam, scams and insults. Never hide criticism of the product, send it to Support instead." }
  ];

  const POSTS = {
    p1: { cap: "Amber Night is back. Warm, smoky, made for long evenings.", net: "IG", kind: "Reel", ago: "2 h" },
    p2: { cap: "Black Friday: 20% off every Discovery set until Monday.", net: "IG", kind: "Ad", ago: "1 d" },
    p3: { cap: "A morning at the studio, pouring Cedar & Fig by hand.", net: "FB", kind: "Post", ago: "2 d" },
    p4: { cap: "Linen Mist restock is live. Spray, breathe, repeat.", net: "TT", kind: "Video", ago: "3 d" }
  };

  const PRODUCTS = {
    amber: { name: "Amber Night candle", price: "$38" },
    disc: { name: "Discovery set (4 minis)", price: "$45" },
    cedar: { name: "Cedar & Fig candle", price: "$38" },
    linen: { name: "Linen Mist room spray", price: "$24" }
  };

  const ITEMS = [];
  let n = 0;
  const add = (o) => { o.id = "i" + (++n); ITEMS.push(o); return o; };

  // ---- Needs you: escalations and knowledge gaps (never bulk)
  add({ agent: "support", type: "escalation", act: null, post: "p4", net: "IG", author: "Claire Dumas", handle: "@claire.dms", followers: 412, ago: 9,
    text: "My daughter got a rash after using the Linen Mist. What is in it??",
    why: "Health issue involving a child. Your rules say I never answer these myself.", flag: "Health and safety" });
  add({ agent: "lead", type: "escalation", act: null, post: "p1", net: "IG", author: "Nina Okafor", handle: "@ninaathome", followers: 128000, ago: 22,
    text: "Obsessed with this scent. Would love to work together on a holiday collab 🤍",
    why: "Creator with 128K followers asking for a partnership. Above your 100K threshold.", flag: "Big account" });
  add({ agent: "support", type: "escalation", act: null, post: "p2", net: "FB", author: "Mark Ellison", handle: "Mark Ellison", followers: 230, ago: 41,
    text: "Charged twice for order #4810 and nobody answers my emails. Calling my bank tomorrow.",
    why: "Payment dispute with a chargeback threat. Needs a human.", flag: "Refund risk" });
  add({ agent: "support", type: "gap", act: "reply", post: "p4", net: "TT", author: "jules", handle: "@julesmakes", followers: 1890, ago: 15,
    text: "is the linen mist safe to spray around cats?",
    why: "I could not find anything about pets on halden.co. Add the answer once and I will reuse it.", flag: "Knowledge gap" });
  add({ agent: "support", type: "gap", act: "reply", post: "p1", net: "IG", author: "Sam Reyes", handle: "@samreyes", followers: 640, ago: 33,
    text: "Do you sell refills for the Amber Night jar?",
    why: "No page mentions refills. Tell me once and I will answer the next ones.", flag: "Knowledge gap" });

  // ---- Lead agent: buying intent
  const leads = [
    ["Maya Lin", "@mayalin", 2300, "p1", "where can I buy the amber one?? 😍", "It's on our site! I just sent you the link in DM 🕯️", "amber", 0.94, "Asks where to buy a product shown in the post."],
    ["Tom Becker", "@tbecker", 310, "p2", "does the discovery set ship to Canada?", "Yes, we ship to Canada in 5 to 7 days. Link to the set is in your DMs.", "disc", 0.9, "Shipping question on a product ad, high intent."],
    ["Aïcha B.", "@aicha.b", 980, "p1", "price?", "$38, and it burns for about 50 hours. Sent you the link!", "amber", 0.88, "Price question on the product post."],
    ["Lena Park", "@lenapark", 5400, "p3", "need this for my mom's birthday, still in stock?", "In stock! Sent you the link, it ships in 24 h 💛", "cedar", 0.92, "Gift intent with a deadline."],
    ["Rob Silva", "@robsilva", 150, "p2", "is the 20% valid on the minis too?", "Yes, the 20% works on every Discovery set until Monday. Link in DM.", "disc", 0.86, "Asks about the Black Friday offer."],
    ["Emma W.", "@emmaw", 2100, "p3", "what does cedar & fig smell like? thinking of ordering", "Woody and a bit sweet, like a fig tree after rain. I sent you the link!", "cedar", 0.83, "Pre-purchase question about a product."],
    ["Hugo M.", "@hugo.m", 720, "p4", "link pls", "Here you go, check your DMs!", "linen", 0.95, "Direct request for the product link."],
    ["Petal & Co Shop", "@petalandco", 3400, "p3", "do you do wholesale for small shops?", "We do! What's the best email to send our wholesale sheet to?", null, 0.78, "Wholesale request from a shop account. Possibly a big order."]
  ];
  leads.forEach(([author, handle, followers, post, text, draft, prod, conf, why], k) => add({
    agent: "lead", type: "lead", act: "reply", post, net: POSTS[post].net, author, handle, followers, ago: 6 + k * 11,
    text, draft, dm: prod ? `${PRODUCTS[prod].name} → ${BRAND.site}/shop/${prod}` : null, product: prod ? PRODUCTS[prod] : null,
    conf, why, src: prod ? "Product catalog" : "Lead rules" }));

  // ---- Support agent: questions it can answer
  const questions = [
    ["Olivia Grant", "@livgrant", 830, "p2", "how long does shipping take to the UK?", "UK orders arrive in 3 to 5 working days. Tracking is sent by email.", 0.93, "halden.co/shipping"],
    ["Ben Carter", "@bencarter", 210, "p1", "is the wax vegan?", "Yes, it's 100% plant wax, vegan and cruelty free.", 0.97, "halden.co/faq"],
    ["Sofia R.", "@sofia.r", 1400, "p3", "my order #4821 still hasn't arrived 😕", "So sorry about that! I sent you a DM so we can check your order.", 0.85, "halden.co/shipping"],
    ["Daniel K.", "@dk.home", 96, "p1", "how long does one candle burn?", "About 50 hours if you trim the wick before each use.", 0.95, "Product page"],
    ["Grace Liu", "@graceliu", 4500, "p2", "can I return an opened candle?", "Opened candles can't be returned, but if something is wrong just DM us and we'll fix it.", 0.89, "halden.co/returns"],
    ["Alex Moreau", "@alexmoreau", 390, "p1", "Smell faded after a week, a bit disappointed", "Sorry to hear that! Trimming the wick to 5 mm helps a lot. DM us if it's still weak, we'll sort it out.", 0.74, "halden.co/faq"],
    ["Ivy Chen", "@ivychen", 1200, "p4", "are the wicks lead free?", "Yes, all our wicks are cotton and lead free.", 0.96, "halden.co/faq"]
  ];
  questions.forEach(([author, handle, followers, post, text, draft, conf, src], k) => add({
    agent: "support", type: "question", act: "reply", post, net: POSTS[post].net, author, handle, followers, ago: 4 + k * 13,
    text, draft, conf, src, why: k === 5 ? "Criticism, not an insult. I answer instead of hiding it." : "Answer found on your website." }));

  // ---- Engagement agent: likes
  const names = ["Chloé", "Marcus", "Priya", "Lucas", "Hannah", "Diego", "Zoe", "Noah", "Amara", "Leo", "Julia", "Theo", "Mila", "Oscar", "Ines", "Kai", "Rosa", "Felix", "Lina", "Sami", "Ella", "Nico", "Ava", "Jonas", "Iris", "Malo", "June", "Ravi", "Nora", "Eli"];
  const praise = ["obsessed 😍", "best candle I've ever owned", "my whole apartment smells amazing", "Amber Night is a 10/10", "bought 3 already lol", "the packaging is so pretty", "gift for my sister, she loved it", "cozy season = this candle", "need this in a bigger size", "love love love", "Linen Mist on my pillow every night", "you guys never miss", "this is my comfort smell", "@juliebrd we need this", "so good 🔥"];
  names.forEach((nm, k) => add({
    agent: "engage", type: "praise", act: "like", post: ["p1", "p2", "p3", "p4"][k % 4], net: ["IG", "IG", "FB", "TT"][k % 4],
    author: nm, handle: "@" + nm.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + (k * 7 % 90), followers: 80 + (k * 137) % 2400, ago: 3 + k * 5,
    text: praise[k % praise.length], conf: 0.95 + (k % 4) / 100, why: "Positive comment.", src: "Brand voice" }));

  // ---- Moderation agent: spam and insults
  const spam = [
    ["promo_boost_24", "DM us to grow your followers fast 🚀🚀"],
    ["crypto.jenna", "I made $4,800 this week with BTC, check my bio"],
    ["shopdeals.global", "Promote this on our page, 2M followers! DM now"],
    ["nice_pics_77", "nice pic 🔥 check my page"],
    ["win.iphone.today", "Congrats! You've been selected for a free iPhone, click the link in bio"],
    ["mark.fx.trader", "Forex signals with 98% win rate, DM 'START'"]
  ];
  for (let k = 0; k < 26; k++) {
    const [h, t] = spam[k % spam.length];
    add({ agent: "mod", type: "spam", act: "hide", post: ["p1", "p2", "p3", "p4"][k % 4], net: ["IG", "IG", "FB", "TT"][k % 4],
      author: h + (k > 5 ? "_" + k : ""), handle: "@" + h + (k > 5 ? "_" + k : ""), followers: 12 + (k * 53) % 400, ago: 2 + k * 6,
      text: t, conf: 0.97, why: "Spam pattern: link in bio, unrelated offer.", src: "Moderation rules" });
  }
  [["Dan R.", "overpriced garbage lol"], ["tr0ll_master", "this brand is a scam, wake up people"], ["K. Vance", "who even buys this crap"], ["no_name_212", "🤡🤡🤡"]].forEach(([a, t], k) =>
    add({ agent: "mod", type: "insult", act: "hide", post: ["p2", "p1", "p3", "p2"][k], net: "IG", author: a, handle: "@" + a.toLowerCase().replace(/[^a-z0-9_]/g, ""), followers: 30 + k * 40, ago: 12 + k * 17,
      text: t, conf: 0.86, why: "Insult with no question or feedback to answer.", src: "Moderation rules" }));

  // ---- Items that arrive while the prototype is open
  const LIVE = [
    { agent: "mod", type: "spam", act: "hide", post: "p1", net: "IG", author: "followers.now", handle: "@followers.now", followers: 8, text: "Get 10K followers for $9, link in bio", conf: 0.98, why: "Spam pattern: paid followers.", src: "Moderation rules" },
    { agent: "engage", type: "praise", act: "like", post: "p1", net: "IG", author: "Mia", handle: "@mia.cozy", followers: 640, text: "just lit mine, heaven", conf: 0.97, why: "Positive comment.", src: "Brand voice" },
    { agent: "lead", type: "lead", act: "reply", post: "p2", net: "IG", author: "Jade Moreau", handle: "@jademoreau", followers: 1800, text: "can I still get the set before Christmas if I order today?", draft: "Yes! Order before Dec 18 and it arrives in time. Link in your DMs 🎁", dm: "Discovery set → halden.co/shop/disc", product: PRODUCTS.disc, conf: 0.91, why: "Purchase question with a deadline.", src: "Product catalog" },
    { agent: "engage", type: "praise", act: "like", post: "p3", net: "FB", author: "Paul", handle: "Paul Girard", followers: 210, text: "Cedar & Fig is the one", conf: 0.96, why: "Positive comment.", src: "Brand voice" },
    { agent: "support", type: "question", act: "reply", post: "p4", net: "TT", author: "lou", handle: "@lou.home", followers: 520, text: "does it stain fabric?", draft: "It shouldn't! Spray from 30 cm away and let it dry, it's water based.", conf: 0.84, why: "Answer found on your website.", src: "halden.co/faq" },
    { agent: "mod", type: "spam", act: "hide", post: "p2", net: "IG", author: "crypto.mike_88", handle: "@crypto.mike_88", followers: 41, text: "Bitcoin doubled my savings, ask me how", conf: 0.98, why: "Spam pattern: crypto scam.", src: "Moderation rules" },
    { agent: "engage", type: "praise", act: "like", post: "p4", net: "TT", author: "Yara", handle: "@yara.b", followers: 3300, text: "ordered 2 more 🤍", conf: 0.98, why: "Positive comment.", src: "Brand voice" }
  ];

  window.DATA = { BRAND, AGENTS, POSTS, PRODUCTS, ITEMS, LIVE, SCANNED_BEFORE: 214 };
})();
