// Official list of Assam Districts
export const ASSAM_DISTRICTS = [
  "Baksa",
  "Barpeta",
  "Biswanath",
  "Bongaigaon",
  "Cachar",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Jorhat",
  "Kamrup",
  "Kamrup Metropolitan",
  "Karbi Anglong",
  "Karimganj",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli",
  "Morigaon",
  "Nagaon",
  "Nalbari",
  "Sivasagar",
  "Sonitpur",
  "South Salmara-Mankachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong",
] as const;

export type AssamDistrict = (typeof ASSAM_DISTRICTS)[number];

// Issue / Problem Categories for the Political Party / Citizen Redressal Portal
export const GRIEVANCE_CATEGORIES = [
  "Roads & Infrastructure",
  "Drinking Water Supply",
  "Electricity & Power",
  "Flood & Disaster Relief",
  "Healthcare & Hospitals",
  "Education & Schools",
  "Sanitation & Drainage",
  "Public Safety & Police",
  "Welfare Schemes & Pension",
  "Administration & Revenue",
  "Agriculture & Irrigation",
  "Other Local Issues",
] as const;

export type GrievanceCategory = (typeof GRIEVANCE_CATEGORIES)[number];
