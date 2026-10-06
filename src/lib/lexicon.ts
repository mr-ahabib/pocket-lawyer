/**
 * Query-understanding lexicon for Bangla / Banglish / English legal questions.
 * Each concept lists surface forms (lowercase latin or Bangla) that map to the
 * Bangla + English search terms actually used in the statutes.
 */
export type Topic = 'police' | 'traffic' | 'cheque' | 'rent' | 'consumer' | 'labour' | 'cyber' | 'family' | 'land' | 'crime' | 'general';

export type Concept = {
  forms: string[]; // user words (Banglish/English/Bangla variants)
  terms: string[]; // statute vocabulary to search for (Bangla & English)
  actHints?: string[]; // substrings of act titles that are most relevant
  topic?: Topic; // playbook used by the answer composer
};

export const CONCEPTS: Concept[] = [
  { forms: ['police', 'pulish', 'পুলিশ'], terms: ['পুলিশ', 'police'], topic: 'police' },
  { forms: ['arrest', 'grep', 'greptar', 'greftar', 'গ্রেফতার', 'গ্রেপ্তার', 'আটক'], terms: ['গ্রেফতার', 'গ্রেপ্তার', 'আটক', 'arrest'], actHints: ['Criminal Procedure', 'ফৌজদারি কার্যবিধি'], topic: 'police' },
  { forms: ['warrant', 'porowana', 'পরোয়ানা'], terms: ['পরোয়ানা', 'warrant'], topic: 'police' },
  { forms: ['bail', 'jamin', 'জামিন'], terms: ['জামিন', 'bail'], actHints: ['Criminal Procedure'], topic: 'police' },
  { forms: ['search', 'tollashi', 'tallashi', 'তল্লাশি', 'তল্লাশী'], terms: ['তল্লাশি', 'তল্লাশী', 'search'], topic: 'police' },
  { forms: ['remand', 'রিমান্ড'], terms: ['রিমান্ড', 'remand', 'custody'], topic: 'police' },
  { forms: ['fir', 'mamla', 'case', 'মামলা', 'এজাহার', 'ejahar'], terms: ['মামলা', 'এজাহার', 'অভিযোগ', 'complaint', 'information'], topic: 'police' },
  { forms: ['gd', 'জিডি', 'general diary', 'diary'], terms: ['সাধারণ ডায়েরি', 'জিডি', 'diary', 'information'], topic: 'police' },
  { forms: ['driving', 'license', 'licence', 'laisens', 'লাইসেন্স', 'ড্রাইভিং'], terms: ['ড্রাইভিং লাইসেন্স', 'লাইসেন্স', 'licence'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন', 'Motor Vehicles'], topic: 'traffic' },
  { forms: ['car', 'gari', 'gaari', 'bike', 'motorcycle', 'motor', 'গাড়ি', 'বাইক', 'মোটরসাইকেল', 'মোটরযান', 'bus', 'বাস', 'truck', 'ট্রাক'], terms: ['মোটরযান', 'motor vehicle', 'যানবাহন'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন', 'Motor Vehicles'], topic: 'traffic' },
  { forms: ['drive', 'driving', 'chalano', 'chalai', 'চালানো', 'চালালে', 'চালাই', 'চালাচ্ছি', 'চালক', 'driver', 'ড্রাইভার'], terms: ['চালা', 'চালক', 'drive', 'driver'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন', 'Motor Vehicles'], topic: 'traffic' },
  { forms: ['traffic', 'trafik', 'ট্রাফিক', 'signal', 'সিগন্যাল', 'sergeant', 'সার্জেন্ট'], terms: ['ট্রাফিক', 'সংকেত', 'traffic'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন'], topic: 'traffic' },
  { forms: ['helmet', 'হেলমেট'], terms: ['হেলমেট', 'helmet'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন'], topic: 'traffic' },
  { forms: ['fitness', 'ফিটনেস', 'registration', 'রেজিস্ট্রেশন', 'নিবন্ধন'], terms: ['ফিটনেস', 'রেজিস্ট্রেশন', 'নিবন্ধন', 'registration'], topic: 'traffic' },
  { forms: ['accident', 'durghotona', 'দুর্ঘটনা', 'hit'], terms: ['দুর্ঘটনা', 'accident'], actHints: ['সড়ক পরিবহণ', 'সড়ক পরিবহন'], topic: 'traffic' },
  { forms: ['speed', 'speeding', 'gati', 'গতি', 'বেপরোয়া'], terms: ['গতি', 'বেপরোয়া', 'rash', 'negligent'], topic: 'traffic' },
  { forms: ['fine', 'jorimana', 'জরিমানা', 'penalty', 'shasti', 'শাস্তি', 'dondo', 'দণ্ড', 'punishment'], terms: ['অর্থদণ্ড', 'জরিমানা', 'দণ্ড', 'কারাদণ্ড', 'fine', 'punish'] },
  { forms: ['jail', 'jel', 'জেল', 'কারাদণ্ড', 'imprisonment', 'prison'], terms: ['কারাদণ্ড', 'imprisonment'] },
  { forms: ['theft', 'churi', 'চুরি', 'stolen', 'chor'], terms: ['চুরি', 'theft'], actHints: ['Penal Code', 'দণ্ডবিধি'], topic: 'crime' },
  { forms: ['robbery', 'dakati', 'ডাকাতি', 'chintai', 'ছিনতাই', 'snatching'], terms: ['ডাকাতি', 'ছিনতাই', 'robbery', 'dacoity', 'extortion'], actHints: ['Penal Code'], topic: 'crime' },
  { forms: ['murder', 'khun', 'খুন', 'হত্যা', 'hotta', 'kill'], terms: ['হত্যা', 'murder', 'culpable homicide'], actHints: ['Penal Code'], topic: 'crime' },
  { forms: ['assault', 'mar', 'mare', 'marse', 'marche', 'marchhe', 'marlo', 'pitay', 'pitaise', 'pitiyeche', 'পিটিয়েছে', 'পেটায়', 'মেরেছে', 'মারে', 'মারছে', 'mardhor', 'মারধর', 'মারামারি', 'beat', 'aghat', 'আঘাত', 'hurt'], terms: ['আঘাত', 'মারধর', 'hurt', 'assault'], actHints: ['Penal Code'], topic: 'crime' },
  { forms: ['threat', 'humki', 'হুমকি', 'intimidation', 'voy', 'ভয়'], terms: ['হুমকি', 'ভীতি প্রদর্শন', 'intimidation', 'threat'], topic: 'crime' },
  { forms: ['fraud', 'protarona', 'প্রতারণা', 'cheat', 'cheating', 'thokano', 'ঠকানো', 'scam'], terms: ['প্রতারণা', 'cheating', 'fraud', 'dishonestly'], topic: 'crime' },
  { forms: ['defamation', 'manhani', 'মানহানি'], terms: ['মানহানি', 'defamation'], topic: 'crime' },
  { forms: ['rape', 'dhorshon', 'ধর্ষণ'], terms: ['ধর্ষণ', 'rape'], actHints: ['নারী ও শিশু', 'Penal Code'], topic: 'family' },
  { forms: ['dowry', 'joutuk', 'যৌতুক'], terms: ['যৌতুক', 'dowry'], actHints: ['যৌতুক', 'নারী ও শিশু'], topic: 'family' },
  { forms: ['harassment', 'hoyrani', 'হয়রানি', 'eve teasing', 'ইভটিজিং', 'উত্ত্যক্ত'], terms: ['হয়রানি', 'উত্ত্যক্ত', 'শ্লীলতাহানি', 'harass', 'modesty'], topic: 'family' },
  { forms: ['acid', 'এসিড'], terms: ['এসিড', 'acid'], topic: 'family' },
  { forms: ['child', 'shishu', 'শিশু', 'baccha', 'বাচ্চা', 'minor'], terms: ['শিশু', 'child', 'minor'], topic: 'family' },
  { forms: ['woman', 'women', 'nari', 'নারী', 'mohila', 'মহিলা', 'wife', 'stri', 'স্ত্রী', 'bou', 'বউ'], terms: ['নারী', 'স্ত্রী', 'woman', 'wife'], topic: 'family' },
  { forms: ['husband', 'shami', 'স্বামী'], terms: ['স্বামী', 'husband'], topic: 'family' },
  { forms: ['domestic violence', 'পারিবারিক সহিংসতা', 'nirjaton', 'nirjatan', 'নির্যাতন', 'torture', 'ghorer moddhe mare', 'শ্বশুরবাড়ি', 'shoshurbari'], terms: ['পারিবারিক সহিংসতা', 'নির্যাতন', 'শারীরিক নির্যাতন'], actHints: ['পারিবারিক সহিংসতা', 'নারী ও শিশু'], topic: 'family' },
  { forms: ['divorce', 'talak', 'তালাক', 'বিচ্ছেদ'], terms: ['তালাক', 'বিবাহ বিচ্ছেদ', 'divorce', 'dissolution'], actHints: ['Muslim Family', 'Divorce', 'মুসলিম পারিবারিক'], topic: 'family' },
  { forms: ['marriage', 'biye', 'biya', 'বিয়ে', 'বিবাহ', 'nikah', 'kabin', 'কাবিন', 'denmohor', 'দেনমোহর', 'dower'], terms: ['বিবাহ', 'কাবিন', 'দেনমোহর', 'marriage', 'dower'], actHints: ['Muslim Family', 'Marriage'], topic: 'family' },
  { forms: ['maintenance', 'khorpos', 'খোরপোশ', 'ভরণপোষণ', 'voronposhon'], terms: ['ভরণপোষণ', 'খোরপোষ', 'maintenance'], topic: 'family' },
  { forms: ['inheritance', 'uttoradhikar', 'উত্তরাধিকার', 'warish', 'ওয়ারিশ', 'succession', 'সম্পত্তি ভাগ'], terms: ['উত্তরাধিকার', 'succession', 'inheritance'], topic: 'family' },
  { forms: ['land', 'jomi', 'jomee', 'জমি', 'ভূমি', 'vumi', 'property', 'sompotti', 'সম্পত্তি'], terms: ['জমি', 'ভূমি', 'সম্পত্তি', 'land', 'immovable property'], actHints: ['ভূমি', 'Land', 'Transfer of Property', 'Registration'], topic: 'land' },
  { forms: ['dokhol', 'দখল', 'possession', 'occupy', 'grab'], terms: ['দখল', 'possession', 'trespass'], topic: 'land' },
  { forms: ['mutation', 'namjari', 'নামজারি', 'khatian', 'খতিয়ান', 'porcha', 'পর্চা'], terms: ['নামজারি', 'খতিয়ান', 'record of rights', 'mutation'], topic: 'land' },
  { forms: ['registration deed', 'dolil', 'দলিল', 'deed'], terms: ['দলিল', 'deed', 'registration'], actHints: ['Registration', 'Transfer of Property'], topic: 'land' },
  { forms: ['pani bondho', 'bidyut bondho', 'current bondho', 'পানি বন্ধ', 'বিদ্যুৎ বন্ধ', 'গ্যাস বন্ধ'], terms: ['পানি', 'বিদ্যুৎ', 'গ্যাস', 'সেবা', 'essential'], actHints: ['বাড়ী ভাড়া'], topic: 'rent' },
  { forms: ['rent', 'vara', 'bhara', 'ভাড়া', 'tenant', 'ভাড়াটিয়া', 'bariwala', 'বাড়িওয়ালা', 'landlord', 'eviction', 'ucched', 'উচ্ছেদ'], terms: ['ভাড়া', 'ভাড়াটিয়া', 'বাড়ির মালিক', 'tenant', 'landlord', 'eviction'], actHints: ['বাড়ী ভাড়া', 'Premises Rent', 'House Rent'], topic: 'rent' },
  { forms: ['consumer', 'vokta', 'ভোক্তা', 'customer', 'crata', 'ক্রেতা', 'buyer'], terms: ['ভোক্তা', 'ক্রেতা', 'consumer'], actHints: ['ভোক্তা'], topic: 'consumer' },
  { forms: ['price', 'dam', 'দাম', 'মূল্য', 'overcharge', 'beshi dam'], terms: ['মূল্য', 'নির্ধারিত মূল্য', 'price'], actHints: ['ভোক্তা'], topic: 'consumer' },
  { forms: ['adulteration', 'vejal', 'bhejal', 'ভেজাল', 'expired', 'মেয়াদোত্তীর্ণ', 'meyad'], terms: ['ভেজাল', 'মেয়াদ উত্তীর্ণ', 'adulterat'], actHints: ['ভোক্তা', 'নিরাপদ খাদ্য'], topic: 'consumer' },
  { forms: ['food', 'khabar', 'খাবার', 'খাদ্য', 'restaurant', 'হোটেল'], terms: ['খাদ্য', 'food'], actHints: ['নিরাপদ খাদ্য', 'ভোক্তা'], topic: 'consumer' },
  { forms: ['medicine', 'oshudh', 'ঔষধ', 'ওষুধ', 'drug', 'pharmacy', 'doctor', 'ডাক্তার', 'hospital', 'হাসপাতাল'], terms: ['ঔষধ', 'ওষুধ', 'চিকিৎসা', 'drug', 'medical'], topic: 'consumer' },
  { forms: ['cheque', 'check', 'chek', 'চেক', 'bounce', 'বাউন্স', 'dishonour', 'dishonor'], terms: ['চেক', 'cheque', 'dishonour', 'insufficiency of funds'], actHints: ['Negotiable Instruments'], topic: 'cheque' },
  { forms: ['loan', 'rin', 'ঋণ', 'debt', 'dhar', 'ধার', 'taka', 'টাকা', 'money', 'paona', 'পাওনা'], terms: ['ঋণ', 'টাকা', 'পাওনা', 'debt', 'loan', 'money'], topic: 'cheque' },
  { forms: ['bank', 'ব্যাংক'], terms: ['ব্যাংক', 'bank'], topic: 'cheque' },
  { forms: ['contract', 'chukti', 'চুক্তি', 'agreement', 'deal'], terms: ['চুক্তি', 'contract', 'agreement'], actHints: ['Contract'] },
  { forms: ['job', 'chakri', 'chakuri', 'চাকরি', 'chakri', 'employee', 'worker', 'sromik', 'শ্রমিক', 'salary', 'beton', 'বেতন', 'wage', 'মজুরি', 'overtime', 'ওভারটাইম', 'fired', 'termination', 'ছাঁটাই', 'chatai', 'bonus', 'বোনাস', 'leave', 'ছুটি', 'chuti', 'maternity', 'মাতৃত্ব'], terms: ['শ্রমিক', 'মজুরি', 'চাকরি', 'ছাঁটাই', 'ছুটি', 'worker', 'wages', 'employment'], actHints: ['শ্রম আইন', 'Labour'], topic: 'labour' },
  { forms: ['facebook', 'ফেসবুক', 'online', 'অনলাইন', 'internet', 'ইন্টারনেট', 'cyber', 'সাইবার', 'hack', 'hacked', 'হ্যাক', 'id', 'account', 'digital', 'ডিজিটাল', 'social media', 'post', 'পোস্ট', 'video', 'ভিডিও', 'photo', 'ছবি', 'chobi', 'blackmail', 'ব্ল্যাকমেইল', 'viral', 'ভাইরাল'], terms: ['ডিজিটাল', 'কম্পিউটার', 'ইলেকট্রনিক', 'অনলাইন', 'digital', 'computer', 'electronic'], actHints: ['সাইবার', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ডিজিটাল নিরাপত্তা'], topic: 'cyber' },
  { forms: ['porn', 'pornography', 'পর্নোগ্রাফি', 'অশ্লীল', 'nude'], terms: ['পর্নোগ্রাফি', 'অশ্লীল', 'obscene'], actHints: ['পর্নোগ্রাফি'], topic: 'cyber' },
  { forms: ['mobile', 'phone', 'ফোন', 'মোবাইল', 'sim', 'সিম', 'call', 'কল'], terms: ['মোবাইল', 'টেলিযোগাযোগ', 'telecommunication'], topic: 'cyber' },
  { forms: ['drug', 'drugs', 'madok', 'মাদক', 'yaba', 'ইয়াবা', 'ganja', 'গাঁজা', 'heroin', 'alcohol', 'মদ', 'mod', 'phensedyl', 'ফেনসিডিল', 'narcotic'], terms: ['মাদকদ্রব্য', 'মাদক', 'narcotic'], actHints: ['মাদকদ্রব্য', 'Narcotics'], topic: 'crime' },
  { forms: ['passport', 'পাসপোর্ট', 'visa', 'ভিসা', 'immigration', 'bidesh', 'বিদেশ', 'migrant', 'প্রবাসী', 'probashi'], terms: ['পাসপোর্ট', 'অভিবাসী', 'passport', 'emigration'], actHints: ['পাসপোর্ট', 'Emigration', 'অভিবাসী'] },
  { forms: ['nid', 'এনআইডি', 'জাতীয় পরিচয়পত্র', 'voter', 'ভোটার', 'birth certificate', 'জন্ম নিবন্ধন'], terms: ['জাতীয় পরিচয়পত্র', 'জন্ম', 'নিবন্ধন', 'identity'] },
  { forms: ['tax', 'kor', 'কর', 'vat', 'ভ্যাট', 'income tax', 'আয়কর'], terms: ['কর', 'আয়কর', 'মূল্য সংযোজন কর', 'tax'], actHints: ['আয়কর', 'Income', 'মূল্য সংযোজন'] },
  { forms: ['company', 'কোম্পানি', 'business', 'byabsa', 'ব্যবসা', 'trade license', 'ট্রেড লাইসেন্স', 'shop', 'dokan', 'দোকান'], terms: ['কোম্পানি', 'ব্যবসা', 'company', 'trade'], actHints: ['Companies', 'কোম্পানী'] },
  { forms: ['election', 'nirbachon', 'নির্বাচন', 'vote', 'ভোট'], terms: ['নির্বাচন', 'ভোট', 'election'] },
  { forms: ['rights', 'odhikar', 'অধিকার', 'fundamental', 'মৌলিক', 'constitution', 'songbidhan', 'সংবিধান', 'freedom', 'স্বাধীনতা', 'equality', 'সমতা'], terms: ['মৌলিক অধিকার', 'অধিকার', 'fundamental rights', 'liberty'], actHints: ['সংবিধান', 'Constitution'] },
  { forms: ['court', 'adalot', 'আদালত', 'judge', 'বিচারক', 'magistrate', 'ম্যাজিস্ট্রেট', 'appeal', 'আপিল', 'hearing', 'শুনানি'], terms: ['আদালত', 'ম্যাজিস্ট্রেট', 'আপিল', 'court', 'magistrate', 'appeal'] },
  { forms: ['lawyer', 'ukil', 'উকিল', 'আইনজীবী', 'advocate', 'legal aid', 'আইনি সহায়তা'], terms: ['আইনজীবী', 'আইনগত সহায়তা', 'advocate', 'legal aid'], actHints: ['আইনগত সহায়তা', 'Legal Aid'] },
  { forms: ['evidence', 'proman', 'প্রমাণ', 'সাক্ষ্য', 'witness', 'sakkhi', 'সাক্ষী'], terms: ['সাক্ষ্য', 'সাক্ষী', 'evidence', 'witness'], actHints: ['Evidence', 'সাক্ষ্য'] },
  { forms: ['information', 'tottho', 'তথ্য', 'rti', 'তথ্য অধিকার'], terms: ['তথ্য', 'information'], actHints: ['তথ্য অধিকার'] },
  { forms: ['bribe', 'ghush', 'ঘুষ', 'durniti', 'দুর্নীতি', 'corruption'], terms: ['ঘুষ', 'দুর্নীতি', 'bribe', 'gratification', 'corruption'], actHints: ['দুর্নীতি দমন', 'Prevention of Corruption', 'Penal Code'], topic: 'police' },
  { forms: ['kidnap', 'kidnapping', 'অপহরণ', 'ophoron', 'abduction', 'missing', 'নিখোঁজ'], terms: ['অপহরণ', 'kidnap', 'abduct'], actHints: ['Penal Code', 'নারী ও শিশু'], topic: 'crime' },
  { forms: ['trafficking', 'pachar', 'পাচার', 'manob pachar', 'মানব পাচার'], terms: ['পাচার', 'trafficking'], actHints: ['মানব পাচার'], topic: 'crime' },
  { forms: ['noise', 'shobdo', 'শব্দ', 'pollution', 'dushon', 'দূষণ', 'environment', 'poribesh', 'পরিবেশ'], terms: ['শব্দ', 'দূষণ', 'পরিবেশ', 'pollution', 'environment'], actHints: ['পরিবেশ', 'Environment'] },
  { forms: ['animal', 'pranee', 'প্রাণী', 'kukur', 'কুকুর', 'dog', 'cow', 'গরু'], terms: ['প্রাণী', 'animal'], actHints: ['প্রাণী কল্যাণ', 'Cruelty to Animals'] },
  { forms: ['disabled', 'protibondhi', 'প্রতিবন্ধী', 'disability'], terms: ['প্রতিবন্ধী', 'disability'], actHints: ['প্রতিবন্ধী'] },
  { forms: ['senior', 'elderly', 'boyosko', 'বয়স্ক', 'parents', 'baba ma', 'বাবা মা', 'পিতা মাতা', 'pita mata'], terms: ['পিতা-মাতা', 'পিতা মাতা', 'parents'], actHints: ['পিতা-মাতার ভরণ-পোষণ'] },
  { forms: ['education', 'shikkha', 'শিক্ষা', 'school', 'স্কুল', 'student', 'ছাত্র', 'university', 'বিশ্ববিদ্যালয়'], terms: ['শিক্ষা', 'শিক্ষার্থী', 'education'] },
  { forms: ['fire', 'agun', 'আগুন', 'arson'], terms: ['অগ্নি', 'আগুন', 'fire', 'mischief by fire'], topic: 'crime' },
  { forms: ['weapon', 'ostro', 'অস্ত্র', 'gun', 'pistol', 'arms', 'knife', 'ছুরি'], terms: ['অস্ত্র', 'arms', 'weapon'], actHints: ['Arms', 'অস্ত্র'], topic: 'crime' },
  { forms: ['gambling', 'jua', 'জুয়া', 'betting', 'casino'], terms: ['জুয়া', 'gaming', 'gambling'], actHints: ['Gambling', 'Public Gambling'] },
  { forms: ['adoption', 'dottok', 'দত্তক', 'guardian', 'ovibabok', 'অভিভাবক', 'custody', 'হেফাজত'], terms: ['অভিভাবক', 'হেফাজত', 'guardian', 'custody', 'ward'], actHints: ['Guardians and Wards'], topic: 'family' },
  { forms: ['will', 'wasiyat', 'ওসিয়ত', 'উইল', 'gift', 'heba', 'হেবা', 'dan', 'দান'], terms: ['উইল', 'হেবা', 'দান', 'gift', 'will'], topic: 'family' },
  { forms: ['nuisance', 'disturb', 'ঝামেলা', 'protibeshi', 'প্রতিবেশী', 'neighbour', 'neighbor'], terms: ['উৎপাত', 'nuisance', 'public nuisance'] },
  { forms: ['trespass', 'onuprobesh', 'অনুপ্রবেশ', 'ghore dhoka'], terms: ['অনধিকার প্রবেশ', 'criminal trespass', 'house-trespass'], topic: 'land' },
  { forms: ['self defence', 'self-defence', 'self defense', 'atmorokkha', 'আত্মরক্ষা'], terms: ['আত্মরক্ষা', 'private defence'], topic: 'crime' },
  { forms: ['protest', 'michil', 'মিছিল', 'assembly', 'সমাবেশ', 'strike', 'hortal', 'হরতাল', 'unlawful assembly'], terms: ['সমাবেশ', 'জনসমাবেশ', 'assembly', 'unlawful assembly', 'riot'] },
  { forms: ['hospital', 'treatment', 'chikitsha', 'চিকিৎসা', 'negligence', 'ovohela', 'অবহেলা'], terms: ['চিকিৎসা', 'অবহেলা', 'negligence', 'medical'] },
];

/** Common Bangla question/filler words that carry no retrieval signal. */
export const STOPWORDS = new Set<string>(
  `আমি আমার আমাকে আমরা আমাদের তুমি তোমার আপনি আপনার সে তার তাকে তারা তাদের ওরা ও এবং বা কি কী কেন কিভাবে কীভাবে কেমন কত কতটা কোথায় কখন কোন কোনো কোনও এই এটা এটি ওটা সেটা যে যা যদি তবে তাহলে হলে হবে হয় হয়েছে হয়েছিল হচ্ছে হওয়া হোক করে করা করি করলে করছে করেছে করবে করতে করব করেন কর নিয়ে দিয়ে থেকে জন্য সাথে সঙ্গে মধ্যে উপর কাছে পরে আগে এখন আজ আজকে কাল গতকাল একটা একটি এক দুই কিছু সব সবাই আছে নেই নাই না নয় নি হ্যাঁ পারি পারে পারবে পারব যায় যাবে যাব গেলে গেছে বলে বলল বলেছে মানে আইন আইনে আইনের অনুযায়ী মতে ধারা ধারায় কেস কেসে বিষয় ব্যাপারে সম্পর্কে নিয়ম কখনো কখনও শুধু অনেক খুব বেশ এখানে সেখানে ছাড়া ব্যতীত ছাড়াই কেউ কাউকে কারো কেহ বের দিতে দিত দেয় দেওয়া দিয়েছে দিল দিব দাও নিতে নিল নেয় নেওয়া মাস দিন বছর সপ্তাহ ঘণ্টা আগে পরে ভিতরে বাইরে কাজ জিনিস কথা লোক মানুষ ব্যক্তি উনি ওনার আপনাকে তোমাকে এখনো এখনও আবার ফের তখন যখন এমন এরকম ওরকম যেমন কারণ কারণে বলে বলা জানি জানতে চাই চাচ্ছি চায় চেয়েছে হোক হউক লাগবে লাগে লাগল সম্ভব উচিত উচিৎ দরকার প্রয়োজন
  under over against into with without about after before during between among through via per etc also just only very much many some any all both each other another such same different new old first last next previous help helping helps need needs want wants know tell give show explain question answer thanks thank hello hi hey sahajjo shahajjo bolo bolun bolen janao janan janen dorkar chai chacchi kichu kisu ektu kintu tai keno kemon korbo korben hobe hoyeche hoise korse korche kore dise dey dilo chay chacche chaise rastay rasta ekhon akhon aj ajke kal gotokal amake amader tader tar oder uni onar
  আর তো যে কি
  সাহায্য সহায়তা বলুন বলো জানাও জানান জানতে চাই দরকার প্রয়োজন কিছু একটু কিন্তু তাই হ্যালো ধন্যবাদ প্রশ্ন উত্তর
  please tell me what how why when where which who is are was were be been the a an in on of for to do does did can could should would will my me i we you he she it they them his her their and or if then so about law laws legal rule rules section act case ki kivabe keno kemon kotha ami amar amake tumi apni apnar hobe hole hoy koro kora korte korle korbo nie diye theke jonno sathe ekta ekti ache nei na ha pari pare jabe gele bole mane er ke te ta ti ra der gulo`.split(/\s+/),
);

/** Bangla inflection suffixes stripped before prefix search (longest first). */
export const BN_SUFFIXES = ['গুলোর', 'গুলির', 'দেরকে', 'গুলো', 'গুলি', 'খানা', 'টার', 'টির', 'দের', 'য়ের', 'ের', 'তে', 'কে', 'রা', 'টা', 'টি', 'র', 'ে', 'য়'];

/**
 * Situation patterns: multi-word real-life phrasings (Bangla/Banglish) that a word-level
 * lexicon misses. Matched against the normalised query; each adds search terms + act hints.
 */
export const SITUATIONS: { re: RegExp; terms: string[]; actHints?: string[]; topic: Topic }[] = [
  { re: /(police|পুলিশ).*(taka|টাকা|ghush|ঘুষ|chay|চায়|চাইছে|dabi|দাবি)/, terms: ['ঘুষ', 'gratification', 'public servant'], actHints: ['Penal Code', 'দুর্নীতি দমন'], topic: 'police' },
  { re: /(police|পুলিশ).*(mare|marse|pitay|মারছে|মেরেছে|পেটায়|torture|নির্যাতন|হয়রানি|hoyrani)/, terms: ['পুলিশ', 'আঘাত', 'হেফাজত', 'নির্যাতন', 'custody'], actHints: ['হেফাজতে মৃত্যু', 'Penal Code'], topic: 'police' },
  { re: /(thana|থানা).*(mamla|মামলা|case|ejahar|এজাহার).*(nei|নেয় না|nicche na|নিচ্ছে না|nilo na|নিল না|nite chay na)/, terms: ['এজাহার', 'information', 'cognizable', 'complaint', 'magistrate'], actHints: ['Criminal Procedure'], topic: 'police' },
  { re: /(mamla|মামলা|case).*(nei|নেয় না|nicche na|নিচ্ছে না|nilo na|নিল না)/, terms: ['এজাহার', 'complaint', 'magistrate'], actHints: ['Criminal Procedure'], topic: 'police' },
  { re: /(bail|jamin|জামিন).*(pabo|পাব|hobe|হবে|kivabe|কীভাবে|kemne)/, terms: ['জামিন', 'bail', 'bailable'], actHints: ['Criminal Procedure'], topic: 'police' },
  { re: /(bariwala|বাড়িওয়ালা|landlord|malik|মালিক).*(ber|বের|uchched|উচ্ছেদ|notice|নোটিশ|chara|ছাড়া)/, terms: ['ভাড়াটিয়া', 'উচ্ছেদ', 'নোটিশ', 'দখল'], actHints: ['বাড়ী ভাড়া'], topic: 'rent' },
  { re: /(bariwala|বাড়িওয়ালা|landlord).*(vara|ভাড়া|bhara).*(baraise|বাড়িয়েছে|barabe|বাড়াবে|barai|বাড়াচ্ছে)/, terms: ['ভাড়া বৃদ্ধি', 'মানসম্মত ভাড়া', 'নিয়ন্ত্রক'], actHints: ['বাড়ী ভাড়া'], topic: 'rent' },
  { re: /(advance|agrim|অগ্রিম|jamanat|জামানত|deposit).*(ferot|ফেরত|dey na|দিচ্ছে না|dicche na)/, terms: ['অগ্রিম', 'জামানত', 'ফেরত', 'ভাড়া'], actHints: ['বাড়ী ভাড়া'], topic: 'rent' },
  { re: /(cheque|check|chek|চেক).*(bounce|বাউন্স|dishonour|dishonor|ferot|ফেরত|return)/, terms: ['চেক', 'cheque', 'dishonour', 'insufficiency'], actHints: ['Negotiable Instruments'], topic: 'cheque' },
  { re: /(taka|টাকা|dhar|ধার|loan|rin|ঋণ).*(dey na|দেয় না|dicche na|দিচ্ছে না|ferot|ফেরত|pabo|পাব|aday|আদায়)/, terms: ['ঋণ', 'debt', 'recovery', 'money', 'suit'], actHints: ['Negotiable Instruments', 'Contract', 'অর্থ ঋণ'], topic: 'cheque' },
  { re: /(beton|বেতন|salary|mojuri|মজুরি).*(dey na|দেয় না|dicche na|দিচ্ছে না|bokeya|বকেয়া|baki|বাকি)/, terms: ['মজুরি পরিশোধ', 'মজুরি', 'বকেয়া', 'wages'], actHints: ['শ্রম আইন'], topic: 'labour' },
  { re: /(chakri|চাকরি|job).*(chole gese|চলে গেছে|gelo|গেল|chatai|ছাঁটাই|ber kore|বের করে|fire|terminate|বরখাস্ত)/, terms: ['ছাঁটাই', 'বরখাস্ত', 'চাকরির অবসান', 'ক্ষতিপূরণ', 'নোটিশ'], actHints: ['শ্রম আইন'], topic: 'labour' },
  { re: /(facebook|ফেসবুক|fb|online|অনলাইন|whatsapp|imo|messenger).*(chobi|ছবি|photo|video|ভিডিও).*(chorano|ছড়িয়ে|chorai|viral|ভাইরাল|post|হুমকি|humki|blackmail|ব্ল্যাকমেইল)/, terms: ['ডিজিটাল', 'অশ্লীল', 'মানহানিকর', 'পর্নোগ্রাফি', 'ইলেকট্রনিক'], actHints: ['সাইবার', 'পর্নোগ্রাফি'], topic: 'cyber' },
  { re: /(id|আইডি|account|অ্যাকাউন্ট).*(hack|হ্যাক)/, terms: ['ডিজিটাল', 'অননুমোদিত প্রবেশ', 'পরিচয়', 'কম্পিউটার'], actHints: ['সাইবার'], topic: 'cyber' },
  { re: /(shami|স্বামী|husband|bou|বউ|stri|স্ত্রী|wife).*(mare|মারে|marse|মারছে|pitay|পেটায়|nirjaton|নির্যাতন|torture|humki|হুমকি)/, terms: ['পারিবারিক সহিংসতা', 'শারীরিক নির্যাতন', 'নির্যাতন'], actHints: ['পারিবারিক সহিংসতা', 'নারী ও শিশু'], topic: 'family' },
  { re: /(joutuk|যৌতুক|dowry).*(chay|চায়|dabi|দাবি|chacche|চাইছে)/, terms: ['যৌতুক', 'যৌতুক দাবি'], actHints: ['যৌতুক নিরোধ', 'নারী ও শিশু'], topic: 'family' },
  { re: /(talak|তালাক|divorce).*(dilo|দিল|dise|দিয়েছে|dite chay|দিতে চায়|dibo|দেব|kivabe|কীভাবে)/, terms: ['তালাক', 'সালিশী পরিষদ', 'নোটিশ', 'divorce'], actHints: ['মুসলিম পারিবারিক', 'Dissolution of Muslim Marriages'], topic: 'family' },
  { re: /(khorposh|খোরপোশ|voronposhon|ভরণপোষণ|maintenance).*(dey na|দেয় না|pabo|পাব|dabi|দাবি)/, terms: ['ভরণপোষণ', 'খোরপোষ', 'maintenance'], actHints: ['পারিবারিক আদালত', 'মুসলিম পারিবারিক'], topic: 'family' },
  { re: /(jomi|জমি|land|bari|বাড়ি|property|সম্পত্তি).*(dokhol|দখল|dakhol|jor kore|জোর করে|niye nise|নিয়ে নিয়েছে|grab)/, terms: ['দখল', 'অনধিকার প্রবেশ', 'জবরদখল', 'possession'], actHints: ['Specific Relief', 'Penal Code', 'ভূমি'], topic: 'land' },
  { re: /(dolil|দলিল|deed).*(jal|জাল|nokol|নকল|fake|forged)/, terms: ['জাল দলিল', 'জালিয়াতি', 'forgery', 'দলিল'], actHints: ['Penal Code', 'Registration'], topic: 'land' },
  { re: /(mobile|মোবাইল|phone|ফোন|wallet|মানিব্যাগ|bag|ব্যাগ).*(churi|চুরি|chintai|ছিনতাই|niye gese|নিয়ে গেছে|harai|হারিয়ে)/, terms: ['চুরি', 'ছিনতাই', 'theft', 'robbery', 'সাধারণ ডায়েরি'], actHints: ['Penal Code', 'Criminal Procedure'], topic: 'crime' },
  { re: /(accident|দুর্ঘটনা|durghotona).*(hoise|হয়েছে|korse|করেছে|korlam|করলাম|ki korbo|কী করব)/, terms: ['দুর্ঘটনা', 'ক্ষতিপূরণ', 'আহত', 'তহবিল'], actHints: ['সড়ক পরিবহণ'], topic: 'traffic' },
  { re: /(license|licence|লাইসেন্স).*(nei|নেই|nai|ছাড়া|chara|expire|মেয়াদ)/, terms: ['ড্রাইভিং লাইসেন্স', 'লাইসেন্স ব্যতীত'], actHints: ['সড়ক পরিবহণ'], topic: 'traffic' },
  { re: /(gari|গাড়ি|bike|বাইক|motorcycle).*(atkaise|আটকে|atke|আটক|niye gese|নিয়ে গেছে|dumping|ডাম্পিং|rekhe dise)/, terms: ['মোটরযান আটক', 'জব্দ', 'ডিজিটাল মামলা', 'লাইসেন্স'], actHints: ['সড়ক পরিবহণ'], topic: 'traffic' },
  { re: /(dam|দাম|price|মূল্য).*(beshi|বেশি|besi|nicche|নিচ্ছে|niye|নিয়েছে)/, terms: ['নির্ধারিত মূল্য', 'অধিক মূল্যে বিক্রয়', 'মূল্য তালিকা'], actHints: ['ভোক্তা'], topic: 'consumer' },
  { re: /(meyad|মেয়াদ|expired|expire).*(ponno|পণ্য|khabar|খাবার|oshudh|ঔষধ|ওষুধ|product)/, terms: ['মেয়াদ উত্তীর্ণ', 'পণ্য বিক্রয়', 'ভেজাল'], actHints: ['ভোক্তা', 'নিরাপদ খাদ্য'], topic: 'consumer' },
  { re: /(doctor|ডাক্তার|hospital|হাসপাতাল).*(vul|ভুল|ovohela|অবহেলা|negligence|mara gese|মারা গেছে)/, terms: ['চিকিৎসা', 'অবহেলা', 'negligence', 'সেবা'], actHints: ['ভোক্তা', 'Penal Code'], topic: 'consumer' },
  { re: /(humki|হুমকি|threat).*(dicche|দিচ্ছে|dey|দেয়|dise|দিয়েছে|mere felbe|মেরে ফেলবে)/, terms: ['ভীতি প্রদর্শন', 'হুমকি', 'intimidation'], actHints: ['Penal Code'], topic: 'crime' },
  { re: /(chanda|চাঁদা|chandabaji|চাঁদাবাজি|extortion)/, terms: ['চাঁদাবাজি', 'extortion', 'বলপূর্বক আদায়'], actHints: ['Penal Code'], topic: 'crime' },
  { re: /(kidnap|অপহরণ|ophoron|nikhoj|নিখোঁজ|missing|khuje pacchi na|খুঁজে পাচ্ছি না)/, terms: ['অপহরণ', 'kidnapping', 'নিখোঁজ', 'সাধারণ ডায়েরি'], actHints: ['Penal Code', 'নারী ও শিশু'], topic: 'crime' },
  { re: /(gd|জিডি|general diary).*(kivabe|কীভাবে|korbo|করব|kora|করা)/, terms: ['সাধারণ ডায়েরি', 'জিডি', 'তথ্য'], actHints: ['Criminal Procedure', 'পুলিশ'], topic: 'police' },
];
