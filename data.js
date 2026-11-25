// Fake data for the Agent Inbox V1 prototypes (January scope).
// Scenario from "Inbox agentique · Point design": the user comes back after 3 days,
// 200 suggestions wait, including 3 leads and 150 spams. Brand: Halden & Co (home fragrance, DTC).
(function () {
  const BRAND = { name: "Halden & Co", site: "halden.co" };
  const DAY = 1440;
  const LAST_VISIT_MIN = 3 * DAY; // last visit 3 days ago

  const AGENTS = [
    { id: "lead", name: "Lead gen agent", short: "Lead gen", dot: "#e8590c",
      role: "Spots buying intent and answers with the right product.",
      acts: ["reply"], source: "Product catalog from halden.co/shop",
      guide: "Answer buying questions in one or two short lines. Send the product link by DM, never in public. Mention the Black Friday code only for Discovery sets." },
    { id: "general", name: "General agent", short: "General", dot: "#1c7ed6",
      role: "Answers questions, likes positive comments and cleans up spam.",
      acts: ["reply", "like", "hide", "delete"], source: "halden.co (FAQ, shipping, returns) and your brand voice",
      guide: "Answer from the FAQ, shipping and returns pages only. Like positive comments. Hide spam and insults, delete scams with links. Never hide criticism of the product, answer it." }
  ];

  // Intents from the classifier. Each intent is one group in the UI.
  const INTENTS = [
    { k: "lead", label: "Leads", agent: "lead", desc: "People ready to buy. Replies come with a product link by DM." },
    { k: "question", label: "Questions", agent: "general", desc: "Answered from halden.co. Read before sending." },
    { k: "positive", label: "Positive comments", agent: "general", desc: "Happy customers to like." },
    { k: "spam", label: "Spam and insults", agent: "general", desc: "Bots and insults to hide, scams to delete." }
  ];

  const POSTS = {
    p1: { cap: "Amber Night is back. Warm, smoky, made for long evenings.", net: "IG", kind: "Reel", ago: "3 d" },
    p2: { cap: "Black Friday: 20% off every Discovery set until Monday.", net: "IG", kind: "Ad", ago: "2 d" },
    p3: { cap: "A morning at the studio, pouring Cedar & Fig by hand.", net: "FB", kind: "Post", ago: "2 d" },
    p4: { cap: "Linen Mist restock is live. Spray, breathe, repeat.", net: "TT", kind: "Video", ago: "1 d" }
  };
  const PK = ["p1", "p2", "p3", "p4"];

  const PRODUCTS = {
    amber: { name: "Amber Night candle", price: "$38" },
    disc: { name: "Discovery set (4 minis)", price: "$45" },
    cedar: { name: "Cedar & Fig candle", price: "$38" },
    linen: { name: "Linen Mist room spray", price: "$24" }
  };

  // deterministic pseudo random
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const age = () => Math.round(5 + rnd() * (LAST_VISIT_MIN - 30));

  const ITEMS = [];
  let n = 0;
  const add = (o) => { o.id = "i" + (++n); ITEMS.push(o); return o; };

  // ---- 3 leads
  [
    ["Maya Lin", "@mayalin", 2300, "p1", "where can I buy the amber one?? 😍", "It's on our site! I just sent you the link in DM 🕯️", "amber", 0.94, "Asks where to buy a product shown in the post.", 40],
    ["Lena Park", "@lenapark", 5400, "p3", "need this for my mom's birthday on Friday, still in stock?", "In stock! Sent you the link, it ships in 24 h so it arrives on time 💛", "cedar", 0.92, "Gift intent with a deadline.", 1300],
    ["Petal & Co Shop", "@petalandco", 3400, "p3", "do you do wholesale for small shops? we have 3 stores", "We do! What's the best email to send our wholesale sheet to?", null, 0.81, "Wholesale request from a shop with 3 stores. Possibly a big order.", 2900]
  ].forEach(([author, handle, followers, post, text, draft, prod, conf, why, ago]) => add({
    agent: "lead", type: "lead", act: "reply", post, net: POSTS[post].net, author, handle, followers, ago,
    text, draft, dm: prod ? `${PRODUCTS[prod].name} → ${BRAND.site}/shop/${prod}` : null, product: prod ? PRODUCTS[prod] : null,
    conf, why, src: prod ? "Product catalog" : "Lead rules" }));

  // ---- 15 questions
  [
    ["Olivia Grant", "@livgrant", 830, "how long does shipping take to the UK?", "UK orders arrive in 3 to 5 working days. Tracking is sent by email.", 0.93, "halden.co/shipping"],
    ["Ben Carter", "@bencarter", 210, "is the wax vegan?", "Yes, it's 100% plant wax, vegan and cruelty free.", 0.97, "halden.co/faq"],
    ["Sofia R.", "@sofia.r", 1400, "my order #4821 still hasn't arrived 😕", "So sorry about that! I sent you a DM so we can check your order.", 0.85, "halden.co/shipping"],
    ["Daniel K.", "@dk.home", 96, "how long does one candle burn?", "About 50 hours if you trim the wick before each use.", 0.95, "Product page"],
    ["Grace Liu", "@graceliu", 4500, "can I return an opened candle?", "Opened candles can't be returned, but if something is wrong just DM us and we'll fix it.", 0.89, "halden.co/returns"],
    ["Alex Moreau", "@alexmoreau", 390, "Smell faded after a week, a bit disappointed", "Sorry to hear that! Trimming the wick to 5 mm helps a lot. DM us if it's still weak, we'll sort it out.", 0.74, "halden.co/faq"],
    ["Ivy Chen", "@ivychen", 1200, "are the wicks lead free?", "Yes, all our wicks are cotton and lead free.", 0.96, "halden.co/faq"],
    ["jules", "@julesmakes", 1890, "is the linen mist safe around cats?", "It's water based, but keep pets out of the room while you spray and until it's dry.", 0.62, "halden.co/faq"],
    ["Sam Reyes", "@samreyes", 640, "do you sell refills for the jar?", "Not yet, but you can reuse the jar once it's empty: hot water and soap does the trick.", 0.66, "halden.co/faq"],
    ["Noor A.", "@noor.a", 300, "does the BF code work in store too?", "The 20% is online only, on every Discovery set until Monday.", 0.9, "halden.co/faq"],
    ["Pia M.", "@piam", 770, "what size is the big candle?", "It's 300 g, about 9 cm tall.", 0.92, "Product page"],
    ["Hugo D.", "@hugod", 150, "can I change my delivery address?", "Yes, if it hasn't shipped yet. I sent you a DM to update it.", 0.86, "halden.co/shipping"],
    ["Clara V.", "@clarav", 2100, "do you ship to Switzerland?", "We do, in 5 to 8 working days. Duties are included.", 0.88, "halden.co/shipping"],
    ["Max T.", "@maxt", 88, "is the packaging recyclable?", "Yes, the box and the glass jar are both recyclable.", 0.94, "halden.co/faq"],
    ["Elsa R.", "@elsar", 520, "when is cedar & fig back in stock?", "It's in stock right now, we restocked on Monday!", 0.83, "Product catalog"]
  ].forEach(([author, handle, followers, text, draft, conf, src], k) => add({
    agent: "general", type: "question", act: "reply", post: PK[k % 4], net: POSTS[PK[k % 4]].net, author, handle, followers, ago: age(),
    text, draft, conf, src, why: k === 5 ? "Criticism, not an insult. I answer instead of hiding it." : conf < 0.7 ? "Partial answer found on your website. Worth a check." : "Answer found on your website." }));

  // ---- 32 positive comments
  const names = ["Chloé", "Marcus", "Priya", "Lucas", "Hannah", "Diego", "Zoe", "Noah", "Amara", "Leo", "Julia", "Theo", "Mila", "Oscar", "Ines", "Kai", "Rosa", "Felix", "Lina", "Sami", "Ella", "Nico", "Ava", "Jonas", "Iris", "Malo", "June", "Ravi", "Nora", "Eli", "Yara", "Paul"];
  const praise = ["obsessed 😍", "best candle I've ever owned", "my whole apartment smells amazing", "Amber Night is a 10/10", "bought 3 already lol", "the packaging is so pretty", "gift for my sister, she loved it", "cozy season = this candle", "love love love", "Linen Mist on my pillow every night", "you guys never miss", "this is my comfort smell", "so good 🔥", "just lit mine, heaven", "ordered 2 more 🤍", "Cedar & Fig is the one"];
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  names.forEach((nm, k) => add({
    agent: "general", type: "positive", act: "like", post: PK[k % 4], net: POSTS[PK[k % 4]].net,
    author: nm, handle: "@" + slug(nm) + (k * 7 % 90), followers: 80 + (k * 137) % 2400, ago: age(),
    text: praise[k % praise.length], conf: 0.95 + (k % 4) / 100, why: "Positive comment.", src: "Brand voice" }));

  // ---- 150 spam: 110 bots to hide, 30 scams to delete, 10 insults to hide
  const bots = ["DM us to grow your followers fast 🚀🚀", "Promote this on our page, 2M followers! DM now", "nice pic 🔥 check my page", "Collab? Send DM to our main account", "Want more views? Link in bio", "💯💯💯 follow back", "Great content! We'd love to feature you, DM us"];
  const scams = ["I made $4,800 this week with BTC, check my bio", "Congrats! You've been selected for a free iPhone, click the link in bio", "Forex signals with 98% win rate, DM 'START'", "Your account will be suspended, verify here: meta-support-check.co"];
  const insults = ["overpriced garbage lol", "this brand is a scam, wake up people", "who even buys this crap", "🤡🤡🤡", "worst brand ever"];
  for (let k = 0; k < 150; k++) {
    const kind = k % 15 === 0 ? "insult" : k % 5 === 1 ? "scam" : "spam";
    const pool = kind === "scam" ? scams : kind === "insult" ? insults : bots;
    const text = pool[k % pool.length];
    const h = (kind === "scam" ? ["crypto.jenna", "win.iphone", "fx.signals", "meta.help.desk"] : kind === "insult" ? ["dan_r", "tr0ll_master", "k.vance", "no_name"] : ["promo_boost", "shopdeals", "nice_pics", "growth.hub", "views4u", "f4f.club", "feature.page"])[k % (kind === "spam" ? 7 : 4)] + "_" + (k + 11);
    add({ agent: "general", type: kind, act: kind === "scam" ? "delete" : "hide", post: PK[k % 4], net: POSTS[PK[k % 4]].net,
      author: h, handle: "@" + h, followers: 3 + (k * 53) % 400, ago: age(), text,
      conf: kind === "insult" ? 0.86 : 0.97,
      why: kind === "scam" ? "Scam with a link. Deleting removes it for everyone." : kind === "insult" ? "Insult with no question or feedback to answer." : "Spam pattern: unrelated offer, link in bio.",
      src: "Moderation rules" });
  }
  // ITEMS.length === 200

  // ---- Items that arrive while the prototype is open (the agent runs continuously)
  const LIVE = [
    { agent: "general", type: "spam", act: "hide", post: "p4", net: "TT", author: "followers.now", handle: "@followers.now", followers: 8, text: "Get 10K followers for $9, link in bio", conf: 0.98, why: "Spam pattern: paid followers.", src: "Moderation rules" },
    { agent: "general", type: "positive", act: "like", post: "p4", net: "TT", author: "Mia", handle: "@mia.cozy", followers: 640, text: "spraying this every morning now", conf: 0.97, why: "Positive comment.", src: "Brand voice" },
    { agent: "lead", type: "lead", act: "reply", post: "p2", net: "IG", author: "Jade Moreau", handle: "@jademoreau", followers: 1800, text: "can I still get the set before Christmas if I order today?", draft: "Yes! Order before Dec 18 and it arrives in time. Link in your DMs 🎁", dm: "Discovery set (4 minis) → halden.co/shop/disc", product: PRODUCTS.disc, conf: 0.91, why: "Purchase question with a deadline.", src: "Product catalog" },
    { agent: "general", type: "question", act: "reply", post: "p4", net: "TT", author: "lou", handle: "@lou.home", followers: 520, text: "does it stain fabric?", draft: "It shouldn't! Spray from 30 cm away and let it dry, it's water based.", conf: 0.84, why: "Answer found on your website.", src: "halden.co/faq" },
    { agent: "general", type: "scam", act: "delete", post: "p2", net: "IG", author: "crypto.mike_88", handle: "@crypto.mike_88", followers: 41, text: "Bitcoin doubled my savings, ask me how", conf: 0.98, why: "Scam with a link. Deleting removes it for everyone.", src: "Moderation rules" }
  ];

  window.DATA = { BRAND, AGENTS, INTENTS, POSTS, PRODUCTS, ITEMS, LIVE, SCANNED_BEFORE: 612, LAST_VISIT_MIN };
})();
