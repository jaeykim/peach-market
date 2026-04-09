import { cookies } from "next/headers";

export type Locale = "ko" | "en" | "zh" | "ja" | "vi" | "mn" | "ru" | "id";

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "en", label: "English", native: "English" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "mn", label: "Mongolian", native: "Монгол" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
];

type Dict = Record<string, string>;

const dicts: Record<Locale, Dict> = {
  ko: {
    "nav.find": "방 찾기",
    "nav.list": "방 올리기",
    "nav.me": "내 활동",
    "nav.login": "로그인",
    "nav.signup": "회원가입",
    "nav.logout": "로그아웃",
    "nav.editProfile": "내 정보 수정",

    "hero.title.line1": "동네에서 만나는",
    "hero.title.line2": "수수료 0원 월세",
    "hero.subtitle":
      "비싸지 않은 월세방, 짧게 머물 방, 복비 없이 만나고 싶은 분들을 위해. 작은 동네 커뮤니티처럼, 피치마켓이 계약서와 안전장치만 조용히 도와드려요.",
    "hero.cta.find": "🔍 방 찾기",
    "hero.cta.list": "🏠 방 올리기",

    "stat.listings": "등록 매물",
    "stat.fee": "중개 수수료",
    "stat.hidden": "숨은 비용",

    "desires.title": "이런 고민, 있으신가요?",
    "desires.subtitle": "피치마켓이 처음부터 끝까지 무료로 해결해드려요.",

    "safety.title": "허위 매물·사기 걱정되시죠?",
    "safety.subtitle": "피치마켓은 4겹의 방어선으로 사기 매물을 막습니다.",

    "types.title": "어떤 계약이든, 무료로",
    "types.subtitle": "월세 · 단기임대 · 전대 — 모두 피치마켓에서",

    "diff.title": "다른 단기임대 플랫폼은요?",
    "diff.subtitle": "계약서 없이 몇 백만원을 주고받고 있으세요?",

    "neighborhood.title": "작은 동네, 신뢰할 수 있는 이웃",

    "how.title": "이렇게 진행돼요",
    "how.subtitle": "복잡한 단계 없이, 중요한 것만 자동으로",

    "cta.title": "복비 없이, 조용히 방을 구하세요",
    "cta.sub": "가입도 검색도 계약도 모두 무료입니다.",

    "apply.button": "🔑 이 방 신청하기",
    "apply.loginRequired": "로그인하고 신청하기",
    "apply.title": "🔑 이 방 신청",

    "map.title": "🏠 동네 월세",
    "map.subtitle": "수수료 없는 월세·단기·전대. 동네에서 직접 만나 계약하세요.",

    "footer.tagline": "수수료 없는 월세 · 단기 · 전대",
    "footer.terms": "이용약관",
    "footer.privacy": "개인정보처리방침",
    "footer.refund": "환불 정책",
  },
  en: {
    "nav.find": "Find a Room",
    "nav.list": "List a Room",
    "nav.me": "My Activity",
    "nav.login": "Log in",
    "nav.signup": "Sign up",
    "nav.logout": "Log out",
    "nav.editProfile": "Edit Profile",

    "hero.title.line1": "Find a room in your neighborhood",
    "hero.title.line2": "with zero commission",
    "hero.subtitle":
      "For people who want affordable monthly rentals, short stays, or to meet directly without broker fees. A small neighborhood community where Peach Market quietly handles contracts and safety.",
    "hero.cta.find": "🔍 Find a Room",
    "hero.cta.list": "🏠 List a Room",

    "stat.listings": "Listings",
    "stat.fee": "Broker Fee",
    "stat.hidden": "Hidden Fees",

    "desires.title": "Got any of these worries?",
    "desires.subtitle": "Peach Market handles everything for free, end to end.",

    "safety.title": "Worried about fake listings or scams?",
    "safety.subtitle": "Peach Market blocks scams with 4 layers of defense.",

    "types.title": "Any rental, all free",
    "types.subtitle": "Monthly · Short-term · Sublet — all on Peach Market",

    "diff.title": "What about other short-term rental platforms?",
    "diff.subtitle": "Sending millions of won without a contract?",

    "neighborhood.title": "A small, trustworthy neighborhood",

    "how.title": "Here's how it works",
    "how.subtitle": "No complicated steps. Only the important things, automated.",

    "cta.title": "Find your room without paying broker fees",
    "cta.sub": "Sign up, search, and sign — all free.",

    "apply.button": "🔑 Apply for this Room",
    "apply.loginRequired": "Log in to apply",
    "apply.title": "🔑 Apply",

    "map.title": "🏠 Rooms in Your Area",
    "map.subtitle":
      "Monthly · short-term · sublet rentals with no broker fees. Meet your landlord directly.",

    "footer.tagline": "Free monthly · short-term · sublet rentals",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.refund": "Refund Policy",
  },
  zh: {
    "nav.find": "找房",
    "nav.list": "发布房源",
    "nav.me": "我的",
    "nav.login": "登录",
    "nav.signup": "注册",
    "nav.logout": "退出",
    "nav.editProfile": "修改资料",

    "hero.title.line1": "在身边的社区",
    "hero.title.line2": "零中介费月租",
    "hero.subtitle":
      "为想要实惠月租、短期居住或不通过中介直接见面的朋友。像小社区一样,Peach Market 静静地处理合同和安全保障。",
    "hero.cta.find": "🔍 找房",
    "hero.cta.list": "🏠 发布房源",

    "stat.listings": "房源",
    "stat.fee": "中介费",
    "stat.hidden": "隐藏费用",

    "desires.title": "您有这些烦恼吗?",
    "desires.subtitle": "Peach Market 全程免费帮您解决。",

    "safety.title": "担心虚假房源或诈骗?",
    "safety.subtitle": "Peach Market 用四重防线阻止诈骗房源。",

    "types.title": "任何合同,全部免费",
    "types.subtitle": "月租 · 短租 · 转租 — 都在 Peach Market",

    "diff.title": "其他短租平台呢?",
    "diff.subtitle": "您正在没有合同就支付几百万韩元吗?",

    "neighborhood.title": "小型可信赖的社区",

    "how.title": "流程是这样的",
    "how.subtitle": "没有复杂的步骤,只有重要的事情自动化。",

    "cta.title": "无需中介费,安静地找到您的房间",
    "cta.sub": "注册、搜索、签约都免费。",

    "apply.button": "🔑 申请这间房",
    "apply.loginRequired": "登录后申请",
    "apply.title": "🔑 申请",

    "map.title": "🏠 您附近的房源",
    "map.subtitle": "零中介费的月租 · 短租 · 转租。直接与房东见面。",

    "footer.tagline": "免费的月租 · 短租 · 转租",
    "footer.terms": "服务条款",
    "footer.privacy": "隐私政策",
    "footer.refund": "退款政策",
  },
  ja: {
    "nav.find": "部屋を探す",
    "nav.list": "部屋を出す",
    "nav.me": "マイページ",
    "nav.login": "ログイン",
    "nav.signup": "新規登録",
    "nav.logout": "ログアウト",
    "nav.editProfile": "プロフィール編集",

    "hero.title.line1": "近所で出会える",
    "hero.title.line2": "手数料ゼロの月額家賃",
    "hero.subtitle":
      "高くない月額家賃、短期滞在、仲介料なしで直接会いたい方のために。小さな近所コミュニティのように、Peach Marketが契約書と安全装置だけそっとお手伝いします。",
    "hero.cta.find": "🔍 部屋を探す",
    "hero.cta.list": "🏠 部屋を出す",

    "stat.listings": "登録物件",
    "stat.fee": "仲介手数料",
    "stat.hidden": "隠れたコスト",

    "desires.title": "こんなお悩み、ありませんか?",
    "desires.subtitle": "Peach Marketが最初から最後まで無料でお手伝いします。",

    "safety.title": "虚偽物件や詐欺が心配ですか?",
    "safety.subtitle": "Peach Marketは4重の防御線で詐欺物件を防ぎます。",

    "types.title": "どんな契約でも、無料で",
    "types.subtitle": "月額 · 短期 · 又貸し — すべてPeach Marketで",

    "diff.title": "他の短期賃貸プラットフォームは?",
    "diff.subtitle": "契約書なしで数百万ウォンを渡していませんか?",

    "neighborhood.title": "小さくて信頼できる近所",

    "how.title": "進行方法",
    "how.subtitle": "複雑な手順なしに、重要なものだけ自動で",

    "cta.title": "仲介料なしで、静かにお部屋探しを",
    "cta.sub": "登録も検索も契約もすべて無料です。",

    "apply.button": "🔑 この部屋に申し込む",
    "apply.loginRequired": "ログインして申し込む",
    "apply.title": "🔑 申し込み",

    "map.title": "🏠 近所の月額家賃",
    "map.subtitle":
      "手数料なしの月額·短期·又貸し。近所で直接会って契約を。",

    "footer.tagline": "手数料なしの月額·短期·又貸し",
    "footer.terms": "利用規約",
    "footer.privacy": "プライバシーポリシー",
    "footer.refund": "返金ポリシー",
  },
  vi: {
    "nav.find": "Tìm phòng",
    "nav.list": "Đăng phòng",
    "nav.me": "Hoạt động của tôi",
    "nav.login": "Đăng nhập",
    "nav.signup": "Đăng ký",
    "nav.logout": "Đăng xuất",
    "nav.editProfile": "Sửa hồ sơ",

    "hero.title.line1": "Tìm phòng trong khu phố của bạn",
    "hero.title.line2": "không mất phí môi giới",
    "hero.subtitle":
      "Dành cho những ai muốn thuê phòng giá rẻ, ở ngắn hạn, hoặc gặp trực tiếp mà không phải trả phí môi giới. Như một cộng đồng khu phố nhỏ, Peach Market lo giúp bạn hợp đồng và đảm bảo an toàn.",
    "hero.cta.find": "🔍 Tìm phòng",
    "hero.cta.list": "🏠 Đăng phòng",

    "stat.listings": "Phòng",
    "stat.fee": "Phí môi giới",
    "stat.hidden": "Phí ẩn",

    "desires.title": "Bạn có những lo lắng này?",
    "desires.subtitle": "Peach Market giải quyết tất cả miễn phí từ đầu đến cuối.",

    "safety.title": "Lo về phòng giả hay lừa đảo?",
    "safety.subtitle": "Peach Market chặn lừa đảo bằng 4 lớp phòng vệ.",

    "types.title": "Mọi loại thuê, đều miễn phí",
    "types.subtitle": "Hàng tháng · Ngắn hạn · Cho thuê lại — tất cả tại Peach Market",

    "diff.title": "Còn các nền tảng cho thuê ngắn hạn khác?",
    "diff.subtitle": "Bạn đang gửi vài triệu won mà không có hợp đồng?",

    "neighborhood.title": "Một khu phố nhỏ, đáng tin cậy",

    "how.title": "Quy trình hoạt động",
    "how.subtitle": "Không có bước phức tạp. Chỉ những điều quan trọng, tự động.",

    "cta.title": "Tìm phòng mà không trả phí môi giới",
    "cta.sub": "Đăng ký, tìm kiếm, ký hợp đồng — tất cả miễn phí.",

    "apply.button": "🔑 Đăng ký phòng này",
    "apply.loginRequired": "Đăng nhập để ứng tuyển",
    "apply.title": "🔑 Đăng ký",

    "map.title": "🏠 Phòng trong khu vực",
    "map.subtitle":
      "Cho thuê hàng tháng · ngắn hạn · sublet không phí môi giới. Gặp chủ nhà trực tiếp.",

    "footer.tagline": "Cho thuê hàng tháng · ngắn hạn · sublet miễn phí",
    "footer.terms": "Điều khoản",
    "footer.privacy": "Quyền riêng tư",
    "footer.refund": "Chính sách hoàn tiền",
  },
  mn: {
    "nav.find": "Өрөө хайх",
    "nav.list": "Өрөө байршуулах",
    "nav.me": "Миний хуудас",
    "nav.login": "Нэвтрэх",
    "nav.signup": "Бүртгүүлэх",
    "nav.logout": "Гарах",
    "nav.editProfile": "Профайл засах",

    "hero.title.line1": "Хорооллын ойролцоох",
    "hero.title.line2": "шимтгэлгүй сарын түрээс",
    "hero.subtitle":
      "Хямд сарын түрээс, богино хугацаатай байр, эсвэл зууч төлбөргүйгээр шууд уулзахыг хүсдэг хүмүүст. Жижиг хорооллын нийгэмлэг шиг Peach Market гэрээ болон аюулгүй байдлыг чимээгүйхэн зохицуулдаг.",
    "hero.cta.find": "🔍 Өрөө хайх",
    "hero.cta.list": "🏠 Өрөө байршуулах",

    "stat.listings": "Зарууд",
    "stat.fee": "Зуучийн төлбөр",
    "stat.hidden": "Нуугдмал төлбөр",

    "desires.title": "Эдгээр санаа зовнил байна уу?",
    "desires.subtitle": "Peach Market бүгдийг үнэгүйгээр шийднэ.",

    "safety.title": "Хуурамч зар, луйвраас айж байна уу?",
    "safety.subtitle": "Peach Market 4 давхар хамгаалалттай.",

    "types.title": "Аливаа гэрээ үнэгүй",
    "types.subtitle": "Сарын · Богино · Дамжуулан түрээс — бүгд Peach Market дээр",

    "diff.title": "Бусад богино хугацааны платформууд?",
    "diff.subtitle": "Гэрээгүйгээр хэдэн сая вон илгээж байна уу?",

    "neighborhood.title": "Жижиг, итгэмжтэй хороолол",

    "how.title": "Ингэж явагдана",
    "how.subtitle": "Төвөгтэй алхамгүй, зөвхөн чухал зүйлс автоматаар",

    "cta.title": "Зууч төлбөргүйгээр өрөө олоорой",
    "cta.sub": "Бүртгэх, хайх, гэрээ хийх бүгд үнэгүй.",

    "apply.button": "🔑 Энэ өрөөнд хүсэлт гаргах",
    "apply.loginRequired": "Нэвтэрч хүсэлт гаргах",
    "apply.title": "🔑 Хүсэлт",

    "map.title": "🏠 Хорооллын өрөөнүүд",
    "map.subtitle":
      "Шимтгэлгүй сарын · богино · дамжуулан түрээс. Гэрийн эзэнтэй шууд уулзана уу.",

    "footer.tagline": "Үнэгүй сарын · богино · дамжуулан түрээс",
    "footer.terms": "Үйлчилгээний нөхцөл",
    "footer.privacy": "Нууцлалын бодлого",
    "footer.refund": "Буцаалтын бодлого",
  },
  ru: {
    "nav.find": "Найти комнату",
    "nav.list": "Разместить",
    "nav.me": "Мой профиль",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.logout": "Выйти",
    "nav.editProfile": "Изменить профиль",

    "hero.title.line1": "Найдите комнату по соседству",
    "hero.title.line2": "без комиссии",
    "hero.subtitle":
      "Для тех, кто хочет недорогую месячную аренду, краткосрочное жильё или встретиться напрямую без брокерских сборов. Как небольшое соседское сообщество, Peach Market тихо помогает с контрактом и безопасностью.",
    "hero.cta.find": "🔍 Найти",
    "hero.cta.list": "🏠 Разместить",

    "stat.listings": "Объявления",
    "stat.fee": "Комиссия",
    "stat.hidden": "Скрытые сборы",

    "desires.title": "У вас есть эти заботы?",
    "desires.subtitle": "Peach Market решает всё бесплатно с начала до конца.",

    "safety.title": "Боитесь фейковых объявлений или мошенничества?",
    "safety.subtitle": "Peach Market блокирует мошенничество четырьмя уровнями защиты.",

    "types.title": "Любая аренда, бесплатно",
    "types.subtitle": "Месячная · Краткосрочная · Субаренда — всё на Peach Market",

    "diff.title": "А другие платформы краткосрочной аренды?",
    "diff.subtitle": "Отправляете миллионы вон без контракта?",

    "neighborhood.title": "Маленькое, надёжное соседство",

    "how.title": "Как это работает",
    "how.subtitle": "Без сложных шагов. Только важное, автоматически.",

    "cta.title": "Найдите комнату без комиссии",
    "cta.sub": "Регистрация, поиск, контракт — всё бесплатно.",

    "apply.button": "🔑 Подать заявку",
    "apply.loginRequired": "Войти и подать заявку",
    "apply.title": "🔑 Заявка",

    "map.title": "🏠 Комнаты рядом",
    "map.subtitle":
      "Месячная, краткосрочная, субаренда без брокерских сборов. Встреча с владельцем напрямую.",

    "footer.tagline": "Бесплатная месячная · краткосрочная · субаренда",
    "footer.terms": "Условия",
    "footer.privacy": "Политика конфиденциальности",
    "footer.refund": "Политика возврата",
  },
  id: {
    "nav.find": "Cari Kamar",
    "nav.list": "Pasang Kamar",
    "nav.me": "Aktivitas Saya",
    "nav.login": "Masuk",
    "nav.signup": "Daftar",
    "nav.logout": "Keluar",
    "nav.editProfile": "Edit Profil",

    "hero.title.line1": "Temukan kamar di lingkungan Anda",
    "hero.title.line2": "tanpa biaya komisi",
    "hero.subtitle":
      "Untuk yang ingin sewa bulanan terjangkau, tinggal singkat, atau bertemu langsung tanpa biaya broker. Seperti komunitas kecil, Peach Market diam-diam mengurus kontrak dan keamanan.",
    "hero.cta.find": "🔍 Cari Kamar",
    "hero.cta.list": "🏠 Pasang Kamar",

    "stat.listings": "Listing",
    "stat.fee": "Biaya Broker",
    "stat.hidden": "Biaya Tersembunyi",

    "desires.title": "Punya kekhawatiran ini?",
    "desires.subtitle": "Peach Market menangani semuanya gratis dari awal sampai akhir.",

    "safety.title": "Khawatir listing palsu atau penipuan?",
    "safety.subtitle": "Peach Market memblokir penipuan dengan 4 lapis pertahanan.",

    "types.title": "Sewa apa pun, semua gratis",
    "types.subtitle": "Bulanan · Jangka pendek · Sublet — semua di Peach Market",

    "diff.title": "Bagaimana dengan platform sewa jangka pendek lainnya?",
    "diff.subtitle": "Mengirim jutaan won tanpa kontrak?",

    "neighborhood.title": "Lingkungan kecil yang dapat dipercaya",

    "how.title": "Begini cara kerjanya",
    "how.subtitle": "Tanpa langkah rumit. Hanya yang penting, otomatis.",

    "cta.title": "Temukan kamar tanpa biaya broker",
    "cta.sub": "Daftar, cari, dan tanda tangan — semua gratis.",

    "apply.button": "🔑 Lamar Kamar Ini",
    "apply.loginRequired": "Masuk untuk melamar",
    "apply.title": "🔑 Lamar",

    "map.title": "🏠 Kamar di Sekitar Anda",
    "map.subtitle":
      "Sewa bulanan · jangka pendek · sublet tanpa biaya broker. Bertemu pemilik langsung.",

    "footer.tagline": "Sewa bulanan · jangka pendek · sublet gratis",
    "footer.terms": "Ketentuan",
    "footer.privacy": "Privasi",
    "footer.refund": "Kebijakan Pengembalian",
  },
};

const COOKIE = "pm_locale";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(COOKIE)?.value as Locale | undefined;
  return v && (v in dicts) ? v : "ko";
}

export function tFor(locale: Locale) {
  return (key: string): string => dicts[locale]?.[key] ?? dicts.ko[key] ?? key;
}
