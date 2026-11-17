// Central translation dictionary. Add a new language by adding a key here —
// every component that calls t('some.key') will pick it up automatically.
export const translations = {
  en: {
    tagline: 'Smart Farming Powered by AI',
    nav: {
      home: 'Home', dashboard: 'Dashboard', chat: 'AI Chat',
      disease: 'Disease Detection', crop: 'Crop Recommendation', weather: 'Weather',
      irrigation: 'Irrigation', fertilizer: 'Fertilizer', market: 'Market',
      schemes: 'Govt. Schemes', news: 'News', reports: 'Reports', profile: 'Profile', settings: 'Settings',
      logout: 'Logout',
    },
    navbar: {
      search: 'Search crops, schemes, reports...',
    },
    welcome: {
      heroLine1: 'Grow smarter with your',
      heroLine2: 'AI field assistant',
      subtitle: "Diagnose crop disease from a photo, get soil-matched crop picks, live mandi prices, and answers in your own language — all in one place.",
      login: 'Login', register: 'Register', guest: 'Continue as Guest',
      featureDisease: 'Disease detection', featureWeather: 'Weather insights', featureMarket: 'Market prices',
    },
    auth: {
      loginTitle: 'Welcome back', loginSubtitle: 'Log in to continue growing smarter.',
      email: 'Email', password: 'Password', remember: 'Remember me', forgot: 'Forgot password?',
      noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
      registerTitle: 'Create your account', registerSubtitle: 'Tell us about your farm to get tailored advice.',
      createAccount: 'Create Account',
    },
    dashboard: {
      greetingGuest: 'Welcome, Guest', greetingUser: 'Namaste',
      subtitle: "Here's what's happening on your farm today.",
      quickActions: 'Quick Actions', uploadLeaf: 'Upload Leaf', askAi: 'Ask AI', cropPick: 'Crop Pick',
      irrigation: 'Irrigation', fertilizer: 'Fertilizer', reports: 'Reports',
      cropHealth: 'Crop Health', marketPrices: 'Market Prices', viewAllPrices: 'View all prices →',
      todaysTasks: "Today's Tasks", govtSchemes: 'Government Schemes', browseSchemes: 'Browse schemes →',
    },
    settings: {
      darkMode: 'Dark Mode', language: 'Language', notifications: 'Notifications', privacy: 'Privacy',
      about: 'About KrishiSahay', help: 'Help & Support', feedback: 'Send Feedback',
    },
  },
  te: {
    tagline: 'AI శక్తితో స్మార్ట్ వ్యవసాయం',
    nav: {
      home: 'హోమ్', dashboard: 'డాష్‌బోర్డ్', chat: 'AI చాట్',
      disease: 'వ్యాధి గుర్తింపు', crop: 'పంట సిఫార్సు', weather: 'వాతావరణం',
      irrigation: 'నీటిపారుదల', fertilizer: 'ఎరువులు', market: 'మార్కెట్',
      schemes: 'ప్రభుత్వ పథకాలు', news: 'వార్తలు', reports: 'నివేదికలు', profile: 'ప్రొఫైల్', settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్అవుట్',
    },
    navbar: {
      search: 'పంటలు, పథకాలు, నివేదికలు వెతకండి...',
    },
    welcome: {
      heroLine1: 'మీ AI వ్యవసాయ సహాయకుడితో',
      heroLine2: 'తెలివిగా పండించండి',
      subtitle: 'ఫోటో నుండి పంట వ్యాధిని గుర్తించండి, నేలకు సరిపడే పంటలను ఎంచుకోండి, మార్కెట్ ధరలను తెలుసుకోండి — అన్నీ ఒకే చోట, మీ భాషలో.',
      login: 'లాగిన్', register: 'నమోదు చేసుకోండి', guest: 'అతిథిగా కొనసాగండి',
      featureDisease: 'వ్యాధి గుర్తింపు', featureWeather: 'వాతావరణ సమాచారం', featureMarket: 'మార్కెట్ ధరలు',
    },
    auth: {
      loginTitle: 'తిరిగి స్వాగతం', loginSubtitle: 'తెలివిగా వ్యవసాయం కొనసాగించడానికి లాగిన్ అవ్వండి.',
      email: 'ఇమెయిల్', password: 'పాస్‌వర్డ్', remember: 'నన్ను గుర్తుంచుకో', forgot: 'పాస్‌వర్డ్ మర్చిపోయారా?',
      noAccount: 'ఖాతా లేదా?', haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      registerTitle: 'మీ ఖాతాను సృష్టించండి', registerSubtitle: 'మీ వ్యవసాయ వివరాలను తెలియజేయండి.',
      createAccount: 'ఖాతా సృష్టించండి',
    },
    dashboard: {
      greetingGuest: 'స్వాగతం, అతిథి', greetingUser: 'నమస్తే',
      subtitle: 'ఈరోజు మీ వ్యవసాయ క్షేత్రంలో ఏమి జరుగుతుందో ఇక్కడ చూడండి.',
      quickActions: 'త్వరిత చర్యలు', uploadLeaf: 'ఆకు అప్‌లోడ్ చేయండి', askAi: 'AI ని అడగండి', cropPick: 'పంట ఎంపిక',
      irrigation: 'నీటిపారుదల', fertilizer: 'ఎరువులు', reports: 'నివేదికలు',
      cropHealth: 'పంట ఆరోగ్యం', marketPrices: 'మార్కెట్ ధరలు', viewAllPrices: 'అన్ని ధరలు చూడండి →',
      todaysTasks: 'నేటి పనులు', govtSchemes: 'ప్రభుత్వ పథకాలు', browseSchemes: 'పథకాలు చూడండి →',
    },
    settings: {
      darkMode: 'డార్క్ మోడ్', language: 'భాష', notifications: 'నోటిఫికేషన్‌లు', privacy: 'గోప్యత',
      about: 'KrishiSahay గురించి', help: 'సహాయం & మద్దతు', feedback: 'అభిప్రాయం పంపండి',
    },
  },
  hi: {
    tagline: 'AI द्वारा संचालित स्मार्ट खेती',
    nav: {
      home: 'होम', dashboard: 'डैशबोर्ड', chat: 'AI चैट',
      disease: 'रोग पहचान', crop: 'फसल सिफारिश', weather: 'मौसम',
      irrigation: 'सिंचाई', fertilizer: 'उर्वरक', market: 'बाज़ार',
      schemes: 'सरकारी योजनाएं', news: 'समाचार', reports: 'रिपोर्ट', profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
    },
    navbar: {
      search: 'फसलें, योजनाएं, रिपोर्ट खोजें...',
    },
    welcome: {
      heroLine1: 'अपने AI कृषि सहायक के साथ',
      heroLine2: 'समझदारी से खेती करें',
      subtitle: 'फोटो से फसल रोग की पहचान करें, मिट्टी के अनुसार सही फसल चुनें, बाज़ार भाव जानें — सब कुछ एक ही जगह, अपनी भाषा में।',
      login: 'लॉगिन', register: 'रजिस्टर करें', guest: 'अतिथि के रूप में जारी रखें',
      featureDisease: 'रोग पहचान', featureWeather: 'मौसम की जानकारी', featureMarket: 'बाज़ार भाव',
    },
    auth: {
      loginTitle: 'वापसी पर स्वागत है', loginSubtitle: 'स्मार्ट खेती जारी रखने के लिए लॉगिन करें।',
      email: 'ईमेल', password: 'पासवर्ड', remember: 'मुझे याद रखें', forgot: 'पासवर्ड भूल गए?',
      noAccount: 'खाता नहीं है?', haveAccount: 'पहले से खाता है?',
      registerTitle: 'अपना खाता बनाएं', registerSubtitle: 'बेहतर सलाह के लिए अपने खेत के बारे में बताएं।',
      createAccount: 'खाता बनाएं',
    },
    dashboard: {
      greetingGuest: 'स्वागत है, अतिथि', greetingUser: 'नमस्ते',
      subtitle: 'आज आपके खेत में क्या हो रहा है, यहां देखें।',
      quickActions: 'त्वरित कार्य', uploadLeaf: 'पत्ती अपलोड करें', askAi: 'AI से पूछें', cropPick: 'फसल चुनें',
      irrigation: 'सिंचाई', fertilizer: 'उर्वरक', reports: 'रिपोर्ट',
      cropHealth: 'फसल स्वास्थ्य', marketPrices: 'बाज़ार भाव', viewAllPrices: 'सभी भाव देखें →',
      todaysTasks: 'आज के कार्य', govtSchemes: 'सरकारी योजनाएं', browseSchemes: 'योजनाएं देखें →',
    },
    settings: {
      darkMode: 'डार्क मोड', language: 'भाषा', notifications: 'सूचनाएं', privacy: 'गोपनीयता',
      about: 'KrishiSahay के बारे में', help: 'सहायता और समर्थन', feedback: 'प्रतिक्रिया भेजें',
    },
  },
}

// Resolve a dot-path like 'nav.dashboard' against a language's dictionary,
// falling back to English then to the key itself if nothing is found.
export function resolve(lang, key) {
  const dig = (obj) => key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj)
  return dig(translations[lang]) ?? dig(translations.en) ?? key
}
