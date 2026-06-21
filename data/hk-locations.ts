// Hong Kong Administrative Regions, Districts, and Areas
// Complete bilingual location data for cascading address selector

export interface Area {
  id: string;
  nameEn: string;
  nameZh: string;
}

export interface District {
  id: string;
  nameEn: string;
  nameZh: string;
  areas: Area[];
}

export interface Region {
  id: string;
  nameEn: string;
  nameZh: string;
  districts: District[];
}

export const hkLocations: Region[] = [
  // ============================================
  // HONG KONG ISLAND (香港島)
  // ============================================
  {
    id: "hk-island",
    nameEn: "Hong Kong Island",
    nameZh: "香港島",
    districts: [
      {
        id: "central-western",
        nameEn: "Central & Western",
        nameZh: "中西區",
        areas: [
          { id: "central", nameEn: "Central", nameZh: "中環" },
          { id: "admiralty", nameEn: "Admiralty", nameZh: "金鐘" },
          { id: "sheung-wan", nameEn: "Sheung Wan", nameZh: "上環" },
          { id: "sai-ying-pun", nameEn: "Sai Ying Pun", nameZh: "西營盤" },
          { id: "kennedy-town", nameEn: "Kennedy Town", nameZh: "堅尼地城" },
          { id: "mid-levels", nameEn: "Mid-Levels", nameZh: "半山區" },
          { id: "peak", nameEn: "The Peak", nameZh: "山頂" },
          { id: "sai-wan", nameEn: "Sai Wan", nameZh: "西環" },
        ],
      },
      {
        id: "wan-chai",
        nameEn: "Wan Chai",
        nameZh: "灣仔區",
        areas: [
          { id: "wan-chai", nameEn: "Wan Chai", nameZh: "灣仔" },
          { id: "causeway-bay", nameEn: "Causeway Bay", nameZh: "銅鑼灣" },
          { id: "happy-valley", nameEn: "Happy Valley", nameZh: "跑馬地" },
          { id: "tai-hang", nameEn: "Tai Hang", nameZh: "大坑" },
          { id: "so-kon-po", nameEn: "So Kon Po", nameZh: "掃桿埔" },
          { id: "leighton-hill", nameEn: "Leighton Hill", nameZh: "禮頓山" },
        ],
      },
      {
        id: "eastern",
        nameEn: "Eastern",
        nameZh: "東區",
        areas: [
          { id: "fortress-hill", nameEn: "Fortress Hill", nameZh: "炮台山" },
          { id: "north-point", nameEn: "North Point", nameZh: "北角" },
          { id: "quarry-bay", nameEn: "Quarry Bay", nameZh: "鰂魚涌" },
          { id: "tai-koo", nameEn: "Tai Koo", nameZh: "太古" },
          { id: "sai-wan-ho", nameEn: "Sai Wan Ho", nameZh: "西灣河" },
          { id: "shau-kei-wan", nameEn: "Shau Kei Wan", nameZh: "筲箕灣" },
          { id: "chai-wan", nameEn: "Chai Wan", nameZh: "柴灣" },
          { id: "taikoo-shing", nameEn: "Taikoo Shing", nameZh: "太古城" },
        ],
      },
      {
        id: "southern",
        nameEn: "Southern",
        nameZh: "南區",
        areas: [
          { id: "aberdeen", nameEn: "Aberdeen", nameZh: "香港仔" },
          { id: "ap-lei-chau", nameEn: "Ap Lei Chau", nameZh: "鴨脷洲" },
          { id: "repulse-bay", nameEn: "Repulse Bay", nameZh: "淺水灣" },
          { id: "stanley", nameEn: "Stanley", nameZh: "赤柱" },
          { id: "wong-chuk-hang", nameEn: "Wong Chuk Hang", nameZh: "黃竹坑" },
          { id: "pok-fu-lam", nameEn: "Pok Fu Lam", nameZh: "薄扶林" },
          { id: "shek-o", nameEn: "Shek O", nameZh: "石澳" },
        ],
      },
    ],
  },

  // ============================================
  // KOWLOON (九龍)
  // ============================================
  {
    id: "kowloon",
    nameEn: "Kowloon",
    nameZh: "九龍",
    districts: [
      {
        id: "yau-tsim-mong",
        nameEn: "Yau Tsim Mong",
        nameZh: "油尖旺區",
        areas: [
          { id: "tsim-sha-tsui", nameEn: "Tsim Sha Tsui", nameZh: "尖沙咀" },
          { id: "jordan", nameEn: "Jordan", nameZh: "佐敦" },
          { id: "yau-ma-tei", nameEn: "Yau Ma Tei", nameZh: "油麻地" },
          { id: "mong-kok", nameEn: "Mong Kok", nameZh: "旺角" },
          { id: "tai-kok-tsui", nameEn: "Tai Kok Tsui", nameZh: "大角咀" },
          { id: "prince-edward", nameEn: "Prince Edward", nameZh: "太子" },
        ],
      },
      {
        id: "sham-shui-po",
        nameEn: "Sham Shui Po",
        nameZh: "深水埗區",
        areas: [
          { id: "sham-shui-po", nameEn: "Sham Shui Po", nameZh: "深水埗" },
          { id: "cheung-sha-wan", nameEn: "Cheung Sha Wan", nameZh: "長沙灣" },
          { id: "lai-chi-kok", nameEn: "Lai Chi Kok", nameZh: "荔枝角" },
          { id: "mei-foo", nameEn: "Mei Foo", nameZh: "美孚" },
          { id: "shek-kip-mei", nameEn: "Shek Kip Mei", nameZh: "石硤尾" },
        ],
      },
      {
        id: "kowloon-city",
        nameEn: "Kowloon City",
        nameZh: "九龍城區",
        areas: [
          { id: "kowloon-city", nameEn: "Kowloon City", nameZh: "九龍城" },
          { id: "to-kwa-wan", nameEn: "To Kwa Wan", nameZh: "土瓜灣" },
          { id: "ma-tau-wai", nameEn: "Ma Tau Wai", nameZh: "馬頭圍" },
          { id: "hung-hom", nameEn: "Hung Hom", nameZh: "紅磡" },
          { id: "kowloon-tong", nameEn: "Kowloon Tong", nameZh: "九龍塘" },
          { id: "ho-man-tin", nameEn: "Ho Man Tin", nameZh: "何文田" },
        ],
      },
      {
        id: "wong-tai-sin",
        nameEn: "Wong Tai Sin",
        nameZh: "黃大仙區",
        areas: [
          { id: "wong-tai-sin", nameEn: "Wong Tai Sin", nameZh: "黃大仙" },
          { id: "diamond-hill", nameEn: "Diamond Hill", nameZh: "鑽石山" },
          { id: "choi-hung", nameEn: "Choi Hung", nameZh: "彩虹" },
          { id: "san-po-kong", nameEn: "San Po Kong", nameZh: "新蒲崗" },
          { id: "ngau-chi-wan", nameEn: "Ngau Chi Wan", nameZh: "牛池灣" },
        ],
      },
      {
        id: "kwun-tong",
        nameEn: "Kwun Tong",
        nameZh: "觀塘區",
        areas: [
          { id: "kwun-tong", nameEn: "Kwun Tong", nameZh: "觀塘" },
          { id: "ngau-tau-kok", nameEn: "Ngau Tau Kok", nameZh: "牛頭角" },
          { id: "kowloon-bay", nameEn: "Kowloon Bay", nameZh: "九龍灣" },
          { id: "lam-tin", nameEn: "Lam Tin", nameZh: "藍田" },
          { id: "yau-tong", nameEn: "Yau Tong", nameZh: "油塘" },
          { id: "sau-mau-ping", nameEn: "Sau Mau Ping", nameZh: "秀茂坪" },
        ],
      },
    ],
  },

  // ============================================
  // NEW TERRITORIES (新界)
  // ============================================
  {
    id: "new-territories",
    nameEn: "New Territories",
    nameZh: "新界",
    districts: [
      {
        id: "tsuen-wan",
        nameEn: "Tsuen Wan",
        nameZh: "荃灣區",
        areas: [
          { id: "tsuen-wan", nameEn: "Tsuen Wan", nameZh: "荃灣" },
          { id: "kwai-chung", nameEn: "Kwai Chung", nameZh: "葵涌" },
          { id: "tsing-yi", nameEn: "Tsing Yi", nameZh: "青衣" },
          { id: "lei-muk-shue", nameEn: "Lei Muk Shue", nameZh: "梨木樹" },
        ],
      },
      {
        id: "tuen-mun",
        nameEn: "Tuen Mun",
        nameZh: "屯門區",
        areas: [
          { id: "tuen-mun", nameEn: "Tuen Mun", nameZh: "屯門" },
          { id: "tuen-mun-town-centre", nameEn: "Tuen Mun Town Centre", nameZh: "屯門市中心" },
          { id: "yuen-long", nameEn: "Yuen Long", nameZh: "元朗" },
          { id: "tin-shui-wai", nameEn: "Tin Shui Wai", nameZh: "天水圍" },
        ],
      },
      {
        id: "yuen-long",
        nameEn: "Yuen Long",
        nameZh: "元朗區",
        areas: [
          { id: "yuen-long-town", nameEn: "Yuen Long Town", nameZh: "元朗市" },
          { id: "tin-shui-wai", nameEn: "Tin Shui Wai", nameZh: "天水圍" },
          { id: "kam-tin", nameEn: "Kam Tin", nameZh: "錦田" },
          { id: "ping-shan", nameEn: "Ping Shan", nameZh: "屏山" },
        ],
      },
      {
        id: "north",
        nameEn: "North",
        nameZh: "北區",
        areas: [
          { id: "sheung-shui", nameEn: "Sheung Shui", nameZh: "上水" },
          { id: "fanling", nameEn: "Fanling", nameZh: "粉嶺" },
          { id: "ta-kwu-ling", nameEn: "Ta Kwu Ling", nameZh: "打鼓嶺" },
        ],
      },
      {
        id: "tai-po",
        nameEn: "Tai Po",
        nameZh: "大埔區",
        areas: [
          { id: "tai-po", nameEn: "Tai Po", nameZh: "大埔" },
          { id: "tai-po-market", nameEn: "Tai Po Market", nameZh: "大埔墟" },
          { id: "tai-wo", nameEn: "Tai Wo", nameZh: "太和" },
        ],
      },
      {
        id: "sha-tin",
        nameEn: "Sha Tin",
        nameZh: "沙田區",
        areas: [
          { id: "sha-tin", nameEn: "Sha Tin", nameZh: "沙田" },
          { id: "fo-tan", nameEn: "Fo Tan", nameZh: "火炭" },
          { id: "ma-on-shan", nameEn: "Ma On Shan", nameZh: "馬鞍山" },
          { id: "tai-wai", nameEn: "Tai Wai", nameZh: "大圍" },
        ],
      },
      {
        id: "sai-kung",
        nameEn: "Sai Kung",
        nameZh: "西貢區",
        areas: [
          { id: "sai-kung", nameEn: "Sai Kung", nameZh: "西貢" },
          { id: "tseung-kwan-o", nameEn: "Tseung Kwan O", nameZh: "將軍澳" },
          { id: "hang-hau", nameEn: "Hang Hau", nameZh: "坑口" },
          { id: "po-lam", nameEn: "Po Lam", nameZh: "寶琳" },
        ],
      },
      {
        id: "kwai-tsing",
        nameEn: "Kwai Tsing",
        nameZh: "葵青區",
        areas: [
          { id: "kwai-chung", nameEn: "Kwai Chung", nameZh: "葵涌" },
          { id: "kwai-fong", nameEn: "Kwai Fong", nameZh: "葵芳" },
          { id: "tsing-yi", nameEn: "Tsing Yi", nameZh: "青衣" },
        ],
      },
      {
        id: "islands",
        nameEn: "Islands",
        nameZh: "離島區",
        areas: [
          { id: "tung-chung", nameEn: "Tung Chung", nameZh: "東涌" },
          { id: "discovery-bay", nameEn: "Discovery Bay", nameZh: "愉景灣" },
          { id: "mui-wo", nameEn: "Mui Wo", nameZh: "梅窩" },
          { id: "cheung-chau", nameEn: "Cheung Chau", nameZh: "長洲" },
          { id: "peng-chau", nameEn: "Peng Chau", nameZh: "坪洲" },
          { id: "lamma-island", nameEn: "Lamma Island", nameZh: "南丫島" },
        ],
      },
    ],
  },
];

// Helper functions
export const findRegionById = (regionId: string): Region | undefined => {
  return hkLocations.find((r) => r.id === regionId);
};

export const findDistrictById = (regionId: string, districtId: string): District | undefined => {
  const region = findRegionById(regionId);
  return region?.districts.find((d) => d.id === districtId);
};

export const findAreaById = (
  regionId: string,
  districtId: string,
  areaId: string
): Area | undefined => {
  const district = findDistrictById(regionId, districtId);
  return district?.areas.find((a) => a.id === areaId);
};

// Get all districts (flattened)
export const getAllDistricts = (): District[] => {
  return hkLocations.flatMap((region) => region.districts);
};

// Find district by name (for backward compatibility with existing addresses)
export const findDistrictByName = (districtName: string): District | undefined => {
  const allDistricts = getAllDistricts();
  return allDistricts.find(
    (d) =>
      d.nameEn.toLowerCase() === districtName.toLowerCase() ||
      d.nameZh === districtName
  );
};
