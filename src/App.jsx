import { useState, useEffect, useRef } from "react";
import React from "react";
import supabase, {
  authSignUp, authSignIn, authSignOut, onAuthChange,
  fetchMerchants, fetchReviews, submitReview,
  submitApplication, fetchApplications, updateAppStatus,
  fetchBookmarks, toggleBookmark
} from "./supabase";

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#F2F2F7;--card:#fff;--ink:#1C1C1E;--ink2:#3A3A3C;--ink3:#515154;--ink4:#8E8E93;--line:rgba(60,60,67,0.13);--red:#E8003D;--green:#34C759;--blue:#0071E3;--f:-apple-system,BlinkMacSystemFont,'Noto Sans SC','PingFang SC',sans-serif}
  html{scroll-behavior:smooth}body{font-family:var(--f);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
  button{font-family:var(--f);cursor:pointer}input,textarea,select{font-family:var(--f)}::placeholder{color:var(--ink4)}
  @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes mo{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  .u0{animation:up .45s both}.u1{animation:up .45s .08s both}.u2{animation:up .45s .16s both}
  .u3{animation:up .45s .24s both}.u4{animation:up .45s .32s both}.mo{animation:mo .25s both}
`;

const LANGS=[
  {code:"zh",label:"简体中文",flag:"🇨🇳"},
  {code:"zt",label:"繁體中文",flag:"🇹🇼"},
  {code:"en",label:"English",flag:"🇬🇧"},
  {code:"ja",label:"日本語",flag:"🇯🇵"},
  {code:"ko",label:"한국어",flag:"🇰🇷"},
  {code:"es",label:"Español",flag:"🇪🇸"},
  {code:"fr",label:"Français",flag:"🇫🇷"},
  {code:"ar",label:"العربية",flag:"🇸🇦",rtl:true},
];

const T={
  zh:{tagline:"K1980 · 华人信用平台",h1:"华人生活服务",h2:"信用平台",heroTag:"只推荐通过 K1980 认证的服务商",heroSub:"移民 · 律师 · 房产 · 留学 · 工作",heroSlogan:"让每一次选择，都更安全",noResults:"该地区/类别暂无服务商。",providerHdr:"服务商入驻",getInTouch:"获取服务",verifiedHdr:"审核通过项目",sub:"移民 · 律师 · 房产 · 教育 · 工作\n每家服务商均通过 K1980 实地审核",sph:"搜索服务商或类别…",sbtn:"搜索",hot:["移民","留学","房产","工作签证"],cats:["移民","律师","房产","教育","工作"],catT:"分类",featT:"本周精选",rankT:"信用榜单",rankS:"本周最受信任",revT:"用户评价",ctaT:"加入 Life1980",ctaS:"通过 K1980 认证，触达数千华人用户。免费入驻，认证套餐 ¥999/年。",ctaB:"申请入驻",login:"登录",reg:"注册",pub:"发布服务",adm:"审核后台",back:"← 返回",cert:"K1980认证",local:"本地实体",yrs:"年经验",cases:"个案例",revs:"条评价",intro:"服务介绍",scope:"服务范围",audit:"K1980 评估",warn:"K1980 提示：请勿提前支付大额费用。",contact:"联系方式",callBtn:"立即咨询",planBtn:"获取方案",auditItems:["营业执照已验证","服务年限已核实","真实评价已确认","无重大投诉记录"],pubT:"发布你的服务",pubS:"加入 Life1980，触达数千华人用户。所有商家均经人工审核。",planT:"选择套餐",freeL:"基础入驻",freeP:"免费",freeD:"基本展示，排名靠后",certL:"K1980 认证",certP:"¥999/年",certD:"优先排名 · 认证标签 · 完整详情页",fName:"公司名称",fReq:"必填",fType:"服务类型",fTypePH:"请选择…",fDesc:"服务简介",fDescPH:"简要介绍服务特色（建议100字以内）",fTel:"联系电话",fWx:"微信号",docsT:"认证资料",docsS:"上传证件可提升信用等级",doc1:"营业执照 / 工商注册证",doc2:"专业执照 / 律师证书 / 地产执照",doc3:"身份证明文件",doc4:"其他支持文件",upload:"选择文件",uploaded:"已上传 ✓",trustLv:"信用等级",terms:"提交即表示同意 Life1980 审核与展示政策。",submitBtn:"提交申请",doneT:"提交成功",doneS:"我们将在 3 个工作日内完成审核。通过认证后即可获得 K1980 信用标签。",backHome:"返回首页",signIn:"登录",signUp:"注册账号",email:"邮箱",pw:"密码",cpw:"确认密码",fullname:"姓名",noAcc:"还没有账号？",hasAcc:"已有账号？",welcome:"欢迎回来",bkm:"我的收藏",myrev:"我的评价",settings:"账号设置",logout:"退出登录",adminT:"审核后台",adminS:"待审核服务商申请",pending:"待审核",approved:"已通过",rejected:"已拒绝",appBtn:"通过",rejBtn:"拒绝",docsLbl:"已提交证件"},
  zt:{tagline:"K1980 · 華人信用平台",h1:"華人生活服務",h2:"信用平台",heroTag:"只推薦通過 K1980 認證的服務商",heroSub:"移民 · 律師 · 房產 · 留學 · 工作",heroSlogan:"讓每一次選擇，都更安全",noResults:"此地區/類別暫無服務商。",providerHdr:"服務商入駐",getInTouch:"獲取服務",verifiedHdr:"審核通過項目",sub:"移民 · 律師 · 房產 · 教育 · 工作\n每家服務商均通過 K1980 實地審核",sph:"搜尋服務商或類別…",sbtn:"搜尋",hot:["移民","留學","房產","工作簽證"],cats:["移民","律師","房產","教育","工作"],catT:"分類",featT:"本週精選",rankT:"信用榜單",rankS:"本週最受信任",revT:"用戶評價",ctaT:"加入 Life1980",ctaS:"通過 K1980 認證，觸達數千華人用戶。免費入駐，認證套餐 ¥999/年。",ctaB:"申請入駐",login:"登入",reg:"註冊",pub:"發佈服務",adm:"審核後台",back:"← 返回",cert:"K1980認證",local:"本地實體",yrs:"年經驗",cases:"個案例",revs:"條評價",intro:"服務介紹",scope:"服務範圍",audit:"K1980 評估",warn:"K1980 提示：請勿提前支付大額費用。",contact:"聯繫方式",callBtn:"立即諮詢",planBtn:"獲取方案",auditItems:["營業執照已驗證","服務年限已核實","真實評價已確認","無重大投訴記錄"],pubT:"發佈你的服務",pubS:"加入 Life1980，觸達數千華人用戶。所有商家均經人工審核。",planT:"選擇套餐",freeL:"基礎入駐",freeP:"免費",freeD:"基本展示，排名靠後",certL:"K1980 認證",certP:"¥999/年",certD:"優先排名 · 認證標籤 · 完整詳情頁",fName:"公司名稱",fReq:"必填",fType:"服務類型",fTypePH:"請選擇…",fDesc:"服務簡介",fDescPH:"簡要介紹服務特色",fTel:"聯繫電話",fWx:"微信號",docsT:"認證資料",docsS:"上傳證件可提升信用等級",doc1:"營業執照 / 工商登記證",doc2:"專業執照 / 律師證書",doc3:"身份證明文件",doc4:"其他支持文件",upload:"選擇文件",uploaded:"已上傳 ✓",trustLv:"信用等級",terms:"提交即表示同意 Life1980 審核與展示政策。",submitBtn:"提交申請",doneT:"提交成功",doneS:"我們將在 3 個工作日內完成審核。通過認證後即可獲得 K1980 信用標籤。",backHome:"返回首頁",signIn:"登入",signUp:"註冊賬號",email:"電郵",pw:"密碼",cpw:"確認密碼",fullname:"姓名",noAcc:"還沒有賬號？",hasAcc:"已有賬號？",welcome:"歡迎回來",bkm:"我的收藏",myrev:"我的評價",settings:"賬號設置",logout:"退出登入",adminT:"審核後台",adminS:"待審核服務商申請",pending:"待審核",approved:"已通過",rejected:"已拒絕",appBtn:"通過",rejBtn:"拒絕",docsLbl:"已提交證件"},
  en:{tagline:"K1980 · Chinese Community Trust",h1:"Chinese Community",h2:"Trust Platform",heroTag:"Only K1980 certified service providers",heroSub:"Immigration · Lawyer · Property · Study · Jobs",heroSlogan:"Every choice, made safer",noResults:"No providers found for this region/category.",providerHdr:"Service Provider",getInTouch:"Get In Touch",verifiedHdr:"Verified Items",sub:"Immigration · Law · Property · Education · Jobs\nEvery provider verified by K1980",sph:"Search providers or categories…",sbtn:"Search",hot:["Immigration","Study","Property","Work Visa"],cats:["Immigration","Lawyer","Property","Education","Jobs"],catT:"Categories",featT:"This Week's Picks",rankT:"Trust Rankings",rankS:"Most Trusted This Week",revT:"Reviews",ctaT:"Join Life1980",ctaS:"Get K1980 certified and reach thousands. Free listing · Certified from ¥999/yr.",ctaB:"Apply Now",login:"Sign In",reg:"Register",pub:"List Service",adm:"Admin Panel",back:"← Back",cert:"K1980 Certified",local:"Local Office",yrs:" yrs",cases:" cases",revs:" reviews",intro:"About",scope:"Services",audit:"K1980 Audit",warn:"K1980 Notice: Do not pay large sums upfront.",contact:"Contact",callBtn:"Consult Now",planBtn:"Get a Quote",auditItems:["Business registration verified","Years of service confirmed","Reviews authenticated","No major complaints"],pubT:"List Your Service",pubS:"Join Life1980 and reach thousands. All providers manually reviewed.",planT:"Choose a Plan",freeL:"Basic Listing",freeP:"Free",freeD:"Basic profile, lower ranking",certL:"K1980 Certified",certP:"¥999/yr",certD:"Priority ranking · Trust badge · Full profile",fName:"Company Name",fReq:"Required",fType:"Service Type",fTypePH:"Select type…",fDesc:"Description",fDescPH:"Summarise your services (100 words)",fTel:"Phone",fWx:"WeChat ID",docsT:"Verification Documents",docsS:"Upload docs to increase trust level",doc1:"Business Registration Certificate",doc2:"Professional / Bar / Real Estate License",doc3:"ID Verification Document",doc4:"Additional Supporting Documents",upload:"Choose File",uploaded:"Uploaded ✓",trustLv:"Trust Level",terms:"By submitting you agree to Life1980 review and listing policies.",submitBtn:"Submit Application",doneT:"Application Submitted",doneS:"We'll review within 3 business days. Once approved you'll receive your K1980 trust badge.",backHome:"Back to Home",signIn:"Sign In",signUp:"Create Account",email:"Email",pw:"Password",cpw:"Confirm Password",fullname:"Full Name",noAcc:"No account?",hasAcc:"Already have an account?",welcome:"Welcome back",bkm:"Saved Providers",myrev:"My Reviews",settings:"Account Settings",logout:"Sign Out",adminT:"Admin Panel",adminS:"Pending Applications",pending:"Pending",approved:"Approved",rejected:"Rejected",appBtn:"Approve",rejBtn:"Reject",docsLbl:"Docs Submitted"},
  ja:{tagline:"K1980 · 華人生活サービス信用プラットフォーム",h1:"华人向けサービスを",h2:"信頼第一で",heroTag:"K1980認証済みの事業者のみを掲載",heroSub:"移民 · 弁護士 · 不動産 · 留学 · 仕事",heroSlogan:"すべての選択を、より安全に",noResults:"この地域/カテゴリに事業者が見つかりません。",providerHdr:"事業者登録",getInTouch:"サービスを取得",verifiedHdr:"確認済み項目",sub:"移民 · 弁護士 · 不動産 · 留学 · 仕事",sph:"事業者またはカテゴリを検索…",sbtn:"検索",hot:["移民","留学","不動産","就労ビザ"],cats:["移民","弁護士","不動産","教育","仕事"],catT:"カテゴリ",featT:"今週のおすすめ",rankT:"信頼ランキング",rankS:"今週最も信頼された",revT:"ユーザーレビュー",ctaT:"Life1980に参加",ctaS:"K1980認証を取得し、数千人の華人ユーザーにリーチ。無料掲載 · 認証プランは¥999/年から。",ctaB:"掲載申請",login:"ログイン",reg:"登録",pub:"サービスを掲載",adm:"管理パネル",back:"← 戻る",cert:"K1980認証",local:"実店舗あり",yrs:"年の経験",cases:"件の実績",revs:"件のレビュー",intro:"サービス概要",scope:"サービス範囲",audit:"K1980審査",warn:"K1980より：多額の前払いはしないでください。",contact:"連絡先",callBtn:"今すぐ相談",planBtn:"見積もりを取得",auditItems:["事業登録確認済み","サービス年数確認済み","レビュー認証済み","重大なクレームなし"],pubT:"サービスを掲載する",pubS:"Life1980に参加し、多くの華人ユーザーにリーチ。全事業者は手動審査されます。",planT:"プランを選択",freeL:"基本掲載",freeP:"無料",freeD:"基本プロフィール、ランキング低め",certL:"K1980認証",certP:"¥999/年",certD:"優先ランキング · 認証バッジ · 完全プロフィール",fName:"会社名",fReq:"必須",fType:"サービスの種類",fTypePH:"選択してください…",fDesc:"説明",fDescPH:"サービスの特徴を簡単に説明してください",fTel:"電話番号",fWx:"WeChat ID",docsT:"認証書類",docsS:"書類をアップロードして信頼レベルを上げる",doc1:"事業登録証明書",doc2:"専門資格証 / 弁護士証 / 不動産ライセンス",doc3:"本人確認書類",doc4:"その他の補足書類",upload:"ファイルを選択",uploaded:"アップロード済み ✓",trustLv:"信頼レベル",terms:"送信することでLife1980の審査・掲載ポリシーに同意します。",submitBtn:"申請を送信",doneT:"申請完了",doneS:"3営業日以内に審査し、ご連絡します。承認後、K1980信頼バッジを取得できます。",backHome:"ホームに戻る",signIn:"ログイン",signUp:"アカウント作成",email:"メールアドレス",pw:"パスワード",cpw:"パスワード確認",fullname:"氏名",noAcc:"アカウントをお持ちでないですか？",hasAcc:"すでにアカウントをお持ちですか？",welcome:"おかえりなさい",bkm:"保存した事業者",myrev:"マイレビュー",settings:"アカウント設定",logout:"ログアウト",adminT:"管理パネル",adminS:"審査待ちの申請",pending:"審査中",approved:"承認済み",rejected:"却下",appBtn:"承認",rejBtn:"却下",docsLbl:"提出書類"},
  ko:{tagline:"K1980 · 화인 생활 서비스 신용 플랫폼",h1:"화인 생활 서비스",h2:"신뢰 플랫폼",heroTag:"K1980 인증 서비스 제공업체만 추천",heroSub:"이민 · 변호사 · 부동산 · 유학 · 취업",heroSlogan:"모든 선택을 더 안전하게",noResults:"이 지역/카테고리에 업체가 없습니다.",providerHdr:"서비스 제공업체 등록",getInTouch:"서비스 받기",verifiedHdr:"확인된 항목",sub:"이민 · 변호사 · 부동산 · 교육 · 취업",sph:"서비스 제공업체 또는 카테고리 검색…",sbtn:"검색",hot:["이민","유학","부동산","취업비자"],cats:["이민","변호사","부동산","교육","취업"],catT:"카테고리",featT:"이번 주 추천",rankT:"신뢰 순위",rankS:"이번 주 가장 신뢰받는",revT:"사용자 후기",ctaT:"Life1980에 참여하기",ctaS:"K1980 인증을 받고 수천 명의 사용자에게 도달하세요. 무료 등록 · 인증 플랜 ¥999/년",ctaB:"신청하기",login:"로그인",reg:"회원가입",pub:"서비스 등록",adm:"관리자 패널",back:"← 뒤로",cert:"K1980 인증",local:"오프라인 사무실",yrs:"년 경력",cases:"건 실적",revs:"개 후기",intro:"서비스 소개",scope:"서비스 범위",audit:"K1980 심사",warn:"K1980 안내: 큰 금액을 선불로 지급하지 마세요.",contact:"연락처",callBtn:"지금 상담",planBtn:"견적 받기",auditItems:["사업자 등록 확인됨","서비스 기간 확인됨","후기 인증됨","주요 불만 없음"],pubT:"서비스를 등록하세요",pubS:"Life1980에 참여하여 수천 명에게 도달하세요. 모든 제공업체는 수동으로 검토됩니다.",planT:"플랜 선택",freeL:"기본 등록",freeP:"무료",freeD:"기본 프로필, 낮은 순위",certL:"K1980 인증",certP:"¥999/년",certD:"우선 순위 · 신뢰 배지 · 전체 프로필",fName:"회사명",fReq:"필수",fType:"서비스 유형",fTypePH:"선택하세요…",fDesc:"설명",fDescPH:"서비스 특징을 간략히 설명하세요",fTel:"전화번호",fWx:"WeChat ID",docsT:"인증 서류",docsS:"서류를 업로드하여 신뢰 등급을 높이세요",doc1:"사업자 등록증",doc2:"전문 자격증 / 변호사 증서 / 부동산 면허",doc3:"신분 확인 서류",doc4:"기타 지원 서류",upload:"파일 선택",uploaded:"업로드 완료 ✓",trustLv:"신뢰 등급",terms:"제출하면 Life1980 검토 및 등록 정책에 동의하는 것입니다.",submitBtn:"신청 제출",doneT:"신청 완료",doneS:"영업일 3일 이내에 검토하고 연락드리겠습니다. 승인 후 K1980 신뢰 배지를 받게 됩니다.",backHome:"홈으로 돌아가기",signIn:"로그인",signUp:"계정 만들기",email:"이메일",pw:"비밀번호",cpw:"비밀번호 확인",fullname:"이름",noAcc:"계정이 없으신가요?",hasAcc:"이미 계정이 있으신가요?",welcome:"다시 오셨군요",bkm:"저장된 업체",myrev:"내 후기",settings:"계정 설정",logout:"로그아웃",adminT:"관리자 패널",adminS:"심사 대기 중인 신청",pending:"대기 중",approved:"승인됨",rejected:"거절됨",appBtn:"승인",rejBtn:"거절",docsLbl:"제출된 서류"},
  es:{tagline:"K1980 · Plataforma de Confianza para la Comunidad China",h1:"Servicios para la",h2:"Comunidad China",heroTag:"Solo recomendamos proveedores certificados por K1980",heroSub:"Inmigración · Abogados · Propiedades · Estudios · Empleo",heroSlogan:"Cada elección, más segura",sub:"Inmigración · Abogados · Propiedades · Educación · Empleo",sph:"Buscar proveedores o categorías…",sbtn:"Buscar",hot:["Inmigración","Estudios","Propiedad","Visa de trabajo"],cats:["Inmigración","Abogado","Propiedad","Educación","Empleo"],catT:"Categorías",featT:"Destacados de la semana",rankT:"Clasificación de confianza",rankS:"Los más confiables esta semana",revT:"Reseñas de usuarios",ctaT:"Únete a Life1980",ctaS:"Obtén la certificación K1980 y llega a miles de usuarios. Listado gratuito · Certificado desde ¥999/año.",ctaB:"Solicitar ahora",login:"Iniciar sesión",reg:"Registrarse",pub:"Publicar servicio",adm:"Panel de administración",back:"← Volver",cert:"Certificado K1980",local:"Oficina local",yrs:" años de exp.",cases:" casos",revs:" reseñas",intro:"Acerca del servicio",scope:"Servicios ofrecidos",audit:"Auditoría K1980",warn:"Aviso K1980: No pague grandes sumas por adelantado.",contact:"Contacto",callBtn:"Consultar ahora",planBtn:"Obtener presupuesto",auditItems:["Registro comercial verificado","Años de servicio confirmados","Reseñas autenticadas","Sin quejas importantes"],pubT:"Publica tu servicio",pubS:"Únete a Life1980 y llega a miles. Todos los proveedores son revisados manualmente.",planT:"Elige un plan",freeL:"Listado básico",freeP:"Gratis",freeD:"Perfil básico, menor ranking",certL:"Certificado K1980",certP:"¥999/año",certD:"Ranking prioritario · Insignia de confianza · Perfil completo",fName:"Nombre de la empresa",fReq:"Requerido",fType:"Tipo de servicio",fTypePH:"Seleccionar tipo…",fDesc:"Descripción",fDescPH:"Resume tus servicios y fortalezas (100 palabras recomendadas)",fTel:"Teléfono",fWx:"WeChat ID",docsT:"Documentos de verificación",docsS:"Sube documentos para aumentar tu nivel de confianza",doc1:"Certificado de registro comercial",doc2:"Licencia profesional / Certificado de abogado / Licencia inmobiliaria",doc3:"Documento de verificación de identidad",doc4:"Documentos adicionales de apoyo",upload:"Elegir archivo",uploaded:"Subido ✓",trustLv:"Nivel de confianza",terms:"Al enviar aceptas las políticas de revisión y listado de Life1980.",submitBtn:"Enviar solicitud",doneT:"Solicitud enviada",doneS:"Revisaremos en 3 días hábiles. Una vez aprobado recibirás tu insignia de confianza K1980.",backHome:"Volver al inicio",signIn:"Iniciar sesión",signUp:"Crear cuenta",email:"Correo electrónico",pw:"Contraseña",cpw:"Confirmar contraseña",fullname:"Nombre completo",noAcc:"¿No tienes cuenta?",hasAcc:"¿Ya tienes cuenta?",welcome:"Bienvenido de nuevo",bkm:"Proveedores guardados",myrev:"Mis reseñas",settings:"Configuración de cuenta",logout:"Cerrar sesión",adminT:"Panel de administración",adminS:"Solicitudes pendientes",pending:"Pendiente",approved:"Aprobado",rejected:"Rechazado",appBtn:"Aprobar",rejBtn:"Rechazar",docsLbl:"Documentos enviados"},
  fr:{tagline:"K1980 · Plateforme de confiance pour la communauté chinoise",h1:"Services pour la",h2:"Communauté Chinoise",heroTag:"Uniquement des prestataires certifiés K1980",heroSub:"Immigration · Avocats · Immobilier · Études · Emploi",heroSlogan:"Chaque choix, rendu plus sûr",sub:"Immigration · Avocats · Immobilier · Éducation · Emploi",sph:"Rechercher des prestataires ou catégories…",sbtn:"Rechercher",hot:["Immigration","Études","Immobilier","Visa de travail"],cats:["Immigration","Avocat","Immobilier","Éducation","Emploi"],catT:"Catégories",featT:"Sélection de la semaine",rankT:"Classement de confiance",rankS:"Les plus fiables cette semaine",revT:"Avis des utilisateurs",ctaT:"Rejoindre Life1980",ctaS:"Obtenez la certification K1980 et atteignez des milliers d'utilisateurs. Inscription gratuite · Certifié à partir de ¥999/an.",ctaB:"Postuler maintenant",login:"Connexion",reg:"S'inscrire",pub:"Publier un service",adm:"Panneau d'administration",back:"← Retour",cert:"Certifié K1980",local:"Bureau local",yrs:" ans d'expérience",cases:" dossiers",revs:" avis",intro:"À propos du service",scope:"Services proposés",audit:"Audit K1980",warn:"Avis K1980 : Ne payez pas de grosses sommes à l'avance.",contact:"Contact",callBtn:"Consulter maintenant",planBtn:"Obtenir un devis",auditItems:["Enregistrement commercial vérifié","Années de service confirmées","Avis authentifiés","Aucune plainte majeure"],pubT:"Publiez votre service",pubS:"Rejoignez Life1980 et atteignez des milliers d'utilisateurs. Tous les prestataires sont examinés manuellement.",planT:"Choisir un plan",freeL:"Inscription de base",freeP:"Gratuit",freeD:"Profil de base, classement inférieur",certL:"Certifié K1980",certP:"¥999/an",certD:"Classement prioritaire · Badge de confiance · Profil complet",fName:"Nom de l'entreprise",fReq:"Obligatoire",fType:"Type de service",fTypePH:"Sélectionner le type…",fDesc:"Description",fDescPH:"Résumez vos services et atouts (100 mots recommandés)",fTel:"Téléphone",fWx:"WeChat ID",docsT:"Documents de vérification",docsS:"Téléchargez des documents pour augmenter votre niveau de confiance",doc1:"Certificat d'enregistrement commercial",doc2:"Licence professionnelle / Certificat d'avocat / Licence immobilière",doc3:"Document de vérification d'identité",doc4:"Documents supplémentaires",upload:"Choisir un fichier",uploaded:"Téléchargé ✓",trustLv:"Niveau de confiance",terms:"En soumettant, vous acceptez les politiques d'examen et d'inscription de Life1980.",submitBtn:"Soumettre la demande",doneT:"Demande soumise",doneS:"Nous examinerons votre demande dans les 3 jours ouvrables. Une fois approuvé, vous recevrez votre badge de confiance K1980.",backHome:"Retour à l'accueil",signIn:"Connexion",signUp:"Créer un compte",email:"Adresse e-mail",pw:"Mot de passe",cpw:"Confirmer le mot de passe",fullname:"Nom complet",noAcc:"Pas de compte ?",hasAcc:"Vous avez déjà un compte ?",welcome:"Bon retour",bkm:"Prestataires sauvegardés",myrev:"Mes avis",settings:"Paramètres du compte",logout:"Déconnexion",adminT:"Panneau d'administration",adminS:"Demandes en attente",pending:"En attente",approved:"Approuvé",rejected:"Rejeté",appBtn:"Approuver",rejBtn:"Rejeter",docsLbl:"Documents soumis"},
  ar:{tagline:"K1980 · منصة الثقة للمجتمع الصيني",h1:"خدمات المجتمع",h2:"الصيني الموثوقة",heroTag:"نوصي فقط بمزودي الخدمة المعتمدين من K1980",heroSub:"الهجرة · المحامون · العقارات · الدراسة · التوظيف",heroSlogan:"كل اختيار، أكثر أماناً",sub:"الهجرة · المحامون · العقارات · التعليم · التوظيف",sph:"ابحث عن مزودي الخدمة أو الفئات…",sbtn:"بحث",hot:["الهجرة","الدراسة","العقارات","تأشيرة العمل"],cats:["الهجرة","محامي","عقارات","تعليم","توظيف"],catT:"الفئات",featT:"مختارات الأسبوع",rankT:"تصنيف الثقة",rankS:"الأكثر موثوقية هذا الأسبوع",revT:"آراء المستخدمين",ctaT:"انضم إلى Life1980",ctaS:"احصل على شهادة K1980 وصل إلى آلاف المستخدمين. إدراج مجاني · شهادة من ¥999 سنوياً.",ctaB:"تقديم الطلب",login:"تسجيل الدخول",reg:"إنشاء حساب",pub:"نشر خدمة",adm:"لوحة الإدارة",back:"→ رجوع",cert:"معتمد K1980",local:"مكتب محلي",yrs:" سنوات خبرة",cases:" حالة",revs:" تقييم",intro:"عن الخدمة",scope:"الخدمات المقدمة",audit:"تدقيق K1980",warn:"تنبيه K1980: لا تدفع مبالغ كبيرة مقدماً.",contact:"التواصل",callBtn:"استشر الآن",planBtn:"احصل على عرض سعر",auditItems:["تم التحقق من السجل التجاري","تم تأكيد سنوات الخدمة","تم توثيق التقييمات","لا توجد شكاوى رئيسية"],pubT:"انشر خدمتك",pubS:"انضم إلى Life1980 وصل إلى الآلاف. جميع المزودين مراجَعون يدوياً.",planT:"اختر خطة",freeL:"إدراج أساسي",freeP:"مجاني",freeD:"ملف شخصي أساسي، ترتيب أدنى",certL:"معتمد K1980",certP:"¥999 / سنة",certD:"ترتيب أولوية · شارة ثقة · ملف كامل",fName:"اسم الشركة",fReq:"مطلوب",fType:"نوع الخدمة",fTypePH:"اختر النوع…",fDesc:"الوصف",fDescPH:"لخّص خدماتك ومميزاتك (100 كلمة موصى بها)",fTel:"رقم الهاتف",fWx:"WeChat ID",docsT:"وثائق التحقق",docsS:"ارفع المستندات لرفع مستوى الثقة",doc1:"شهادة تسجيل الأعمال",doc2:"ترخيص مهني / شهادة محامٍ / ترخيص عقاري",doc3:"وثيقة التحقق من الهوية",doc4:"مستندات داعمة إضافية",upload:"اختر ملفاً",uploaded:"تم الرفع ✓",trustLv:"مستوى الثقة",terms:"بالإرسال توافق على سياسات المراجعة والإدراج في Life1980.",submitBtn:"إرسال الطلب",doneT:"تم إرسال الطلب",doneS:"سنراجع طلبك خلال 3 أيام عمل. بعد الموافقة ستحصل على شارة ثقة K1980.",backHome:"العودة إلى الرئيسية",signIn:"تسجيل الدخول",signUp:"إنشاء حساب",email:"البريد الإلكتروني",pw:"كلمة المرور",cpw:"تأكيد كلمة المرور",fullname:"الاسم الكامل",noAcc:"ليس لديك حساب؟",hasAcc:"لديك حساب بالفعل؟",welcome:"مرحباً بعودتك",bkm:"المزودون المحفوظون",myrev:"تقييماتي",settings:"إعدادات الحساب",logout:"تسجيل الخروج",adminT:"لوحة الإدارة",adminS:"طلبات قيد المراجعة",pending:"قيد الانتظار",approved:"معتمد",rejected:"مرفوض",appBtn:"اعتماد",rejBtn:"رفض",docsLbl:"المستندات المقدمة"},
};

const REGIONS=[{c:"all",zh:"全部",zt:"全部",en:"All",flag:"🌍"},{c:"nz",zh:"新西兰",zt:"新西蘭",en:"New Zealand",flag:"🇳🇿"},{c:"au",zh:"澳大利亚",zt:"澳大利亞",en:"Australia",flag:"🇦🇺"},{c:"ca",zh:"加拿大",zt:"加拿大",en:"Canada",flag:"🇨🇦"},{c:"us",zh:"美国",zt:"美國",en:"USA",flag:"🇺🇸"},{c:"uk",zh:"英国",zt:"英國",en:"UK",flag:"🇬🇧"},{c:"sg",zh:"新加坡",zt:"新加坡",en:"Singapore",flag:"🇸🇬"},{c:"my",zh:"马来西亚",zt:"馬來西亞",en:"Malaysia",flag:"🇲🇾"}];

// cats order: 0=Immigration 1=Lawyer 2=Property 3=Education 4=Jobs
const MS=[
  {id:1,name:"ABC 移民顾问",nameEn:"ABC Immigration",catI:0,regions:["nz","au"],rating:4.9,rev:214,years:12,cases:800,cert:true,local:true,tel:"+64 9 123 4567",wx:"ABC_NZ",score:{合规性:98,服务质量:95,成功率:92,收费透明:96}},
  {id:2,name:"奥克兰华人地产",nameEn:"Auckland Chinese Realty",catI:2,regions:["nz"],rating:4.8,rev:163,years:9,cases:560,cert:true,local:true,tel:"+64 9 234 5678",wx:"AKL_Property",score:{合规性:94,服务质量:97,成功率:90,收费透明:93}},
  {id:3,name:"光明留学中心",nameEn:"Bright Education NZ",catI:3,regions:["nz","au","sg"],rating:4.7,rev:309,years:7,cases:1200,cert:true,local:false,tel:"+64 9 345 6789",wx:"BrightEdu",score:{合规性:91,服务质量:93,成功率:95,收费透明:88}},
  {id:4,name:"李氏律师事务所",nameEn:"Lee & Associates",catI:1,regions:["nz","uk"],rating:4.8,rev:98,years:15,cases:430,cert:true,local:true,tel:"+64 9 456 7890",wx:"LeeLaw",score:{合规性:99,服务质量:92,成功率:88,收费透明:97}},
  {id:5,name:"枫叶移民咨询",nameEn:"Maple Immigration Canada",catI:0,regions:["ca"],rating:4.7,rev:187,years:10,cases:650,cert:true,local:true,tel:"+1 416 555 0198",wx:"MapleImmCA",score:{合规性:96,服务质量:94,成功率:91,收费透明:95}},
];

// Merchant content per language: sub · detail · svcs · scoreKeys · review texts
const ML={
  1:{
    zh:{sub:"技术移民 · 投资移民 · 家庭团聚",detail:"团队全员持牌持证，专注技术移民、投资移民、工作签证及家庭团聚。12年从业，成功协助800+家庭获批，全程中文，费用透明。",svcs:["技术移民","投资移民","家庭团聚","工作签证","签证续签"],sk:["合规性","服务质量","成功率","收费透明"]},
    zt:{sub:"技術移民 · 投資移民 · 家庭團聚",detail:"團隊全員持牌持證，專注技術移民、投資移民、工作簽證及家庭團聚。12年從業，成功協助800+家庭獲批，全程中文，費用透明。",svcs:["技術移民","投資移民","家庭團聚","工作簽證","簽證續簽"],sk:["合規性","服務質量","成功率","收費透明"]},
    en:{sub:"Skilled · Investor · Family",detail:"Fully licensed team specialising in skilled migration, investor visas, work visas and family reunification. 12 years, 800+ approvals.",svcs:["Skilled Migrant","Investor Visa","Family Reunification","Work Visa","Visa Renewal"],sk:["Compliance","Service Quality","Success Rate","Transparency"]},
    ja:{sub:"技術移民 · 投資移民 · 家族呼び寄せ",detail:"全員が認定資格を持つチームで、技術移民・投資移民・就労ビザ・家族呼び寄せを専門に扱います。12年の経験で800件以上の申請を成功させました。",svcs:["技術移民","投資移民","家族呼び寄せ","就労ビザ","ビザ更新"],sk:["コンプライアンス","サービス品質","成功率","料金透明性"]},
    ko:{sub:"기술이민 · 투자이민 · 가족초청",detail:"기술이민, 투자이민, 취업비자, 가족초청을 전문으로 하는 자격 보유 팀. 12년 경력, 800건 이상 승인.",svcs:["기술이민","투자이민","가족초청","취업비자","비자 연장"],sk:["규정준수","서비스품질","성공률","요금투명성"]},
    es:{sub:"Migración calificada · Inversión · Familia",detail:"Equipo plenamente habilitado especializado en migración calificada, visas de inversión, visas de trabajo y reunificación familiar. 12 años, más de 800 aprobaciones.",svcs:["Migración Calificada","Visa de Inversión","Reunificación Familiar","Visa de Trabajo","Renovación de Visa"],sk:["Cumplimiento","Calidad de Servicio","Tasa de Éxito","Transparencia"]},
    fr:{sub:"Migration qualifiée · Investissement · Famille",detail:"Équipe entièrement agréée spécialisée en migration qualifiée, visas d'investisseur, visas de travail et regroupement familial. 12 ans, plus de 800 approbations.",svcs:["Migration Qualifiée","Visa Investisseur","Regroupement Familial","Visa de Travail","Renouvellement de Visa"],sk:["Conformité","Qualité de Service","Taux de Réussite","Transparence"]},
    ar:{sub:"هجرة مهنية · استثمار · لم شمل",detail:"فريق مرخص بالكامل متخصص في الهجرة المهنية وتأشيرات الاستثمار وتأشيرات العمل ولم الشمل. 12 عاماً، أكثر من 800 موافقة.",svcs:["هجرة مهنية","تأشيرة مستثمر","لم الشمل","تأشيرة عمل","تجديد التأشيرة"],sk:["الامتثال","جودة الخدمة","معدل النجاح","الشفافية"]},
  },
  2:{
    zh:{sub:"住宅买卖 · 租赁 · 估价",detail:"专注奥克兰北岸、CBD及东区住宅市场，全流程中英双语服务，合同细节逐条解读，协助超过560个华人家庭安家落户。",svcs:["住宅买卖","投资房产","租赁管理","房产估价","海外买家咨询"],sk:["合规性","服务质量","成功率","收费透明"]},
    zt:{sub:"住宅買賣 · 租賃 · 估價",detail:"專注奧克蘭北岸、CBD及東區住宅市場，全流程中英雙語服務，合同細節逐條解讀，協助超過560個華人家庭安家落戶。",svcs:["住宅買賣","投資房產","租賃管理","房產估價","海外買家諮詢"],sk:["合規性","服務質量","成功率","收費透明"]},
    en:{sub:"Buy · Sell · Rent · Valuation",detail:"North Shore, CBD and eastern Auckland residential specialist. Full bilingual service, clause-by-clause contract guidance. 560+ families settled.",svcs:["Buy/Sell","Investment Property","Property Mgmt","Valuation","Overseas Buyer"],sk:["Compliance","Service Quality","Success Rate","Transparency"]},
    ja:{sub:"住宅売買 · 賃貸 · 査定",detail:"オークランドのノースショア・CBD・東部エリアを専門とする不動産業者。中英バイリンガル対応、契約条項を丁寧に解説。560世帯以上の定住をサポート。",svcs:["住宅売買","投資用不動産","賃貸管理","不動産査定","海外購入者相談"],sk:["コンプライアンス","サービス品質","成功率","料金透明性"]},
    ko:{sub:"주택 매매 · 임대 · 감정",detail:"오클랜드 노스쇼어·CBD·동부 지역 전문 부동산. 이중언어 계약 지원, 560가구 이상 정착 도움.",svcs:["주택매매","투자부동산","임대관리","부동산감정","해외구매자상담"],sk:["규정준수","서비스품질","성공률","요금투명성"]},
    es:{sub:"Compra · Venta · Alquiler · Tasación",detail:"Especialista en Auckland Norte, CBD y zona este. Servicio bilingüe completo, explicación cláusula por cláusula. Más de 560 familias instaladas.",svcs:["Compra/Venta","Inversión Inmobiliaria","Gestión de Alquiler","Tasación","Comprador Extranjero"],sk:["Cumplimiento","Calidad de Servicio","Tasa de Éxito","Transparencia"]},
    fr:{sub:"Achat · Vente · Location · Estimation",detail:"Spécialiste résidentiel à Auckland Nord, CBD et est. Service bilingue complet, explication clause par clause. Plus de 560 familles installées.",svcs:["Achat/Vente","Investissement Immobilier","Gestion Locative","Estimation","Acheteur Étranger"],sk:["Conformité","Qualité de Service","Taux de Réussite","Transparence"]},
    ar:{sub:"شراء · بيع · إيجار · تقييم",detail:"متخصص في المناطق السكنية في أوكلاند شمال و CBD و الشرق. خدمة ثنائية اللغة كاملة، شرح تفصيلي للعقود. أكثر من 560 عائلة تم توطينها.",svcs:["شراء/بيع","عقارات استثمارية","إدارة الإيجار","تقييم العقارات","مشتري أجنبي"],sk:["الامتثال","جودة الخدمة","معدل النجاح","الشفافية"]},
  },
  3:{
    zh:{sub:"大学申请 · 语言培训 · 奖学金",detail:"覆盖高中、本科、研究生申请，专注新西兰8大及澳大利亚G8。语言培训与申请一体化，近三年综合录取率91%，累计服务超1200名学生。",svcs:["大学申请","高中留学","语言培训","奖学金申请","入学跟进"],sk:["合规性","服务质量","成功率","收费透明"]},
    zt:{sub:"大學申請 · 語言培訓 · 獎學金",detail:"覆蓋高中、本科、研究生申請，專注新西蘭8大及澳大利亞G8。語言培訓與申請一體化，近三年綜合錄取率91%，累計服務超1200名學生。",svcs:["大學申請","高中留學","語言培訓","獎學金申請","入學跟進"],sk:["合規性","服務質量","成功率","收費透明"]},
    en:{sub:"University · Language · Scholarships",detail:"Secondary, undergraduate and postgraduate applications. NZ top-8 and Australian G8. Integrated language training and admissions. 91% acceptance rate, 1200+ students served.",svcs:["University","High School","Language Training","Scholarships","Post-Enrollment"],sk:["Compliance","Service Quality","Success Rate","Transparency"]},
    ja:{sub:"大学出願 · 語学研修 · 奨学金",detail:"高校・学部・大学院の出願をカバー。NZ上位8校とオーストラリアG8に特化。語学研修と出願サポートを一体化。合格率91%、1200名以上のサポート実績。",svcs:["大学出願","高校留学","語学研修","奨学金申請","入学後サポート"],sk:["コンプライアンス","サービス品質","成功率","料金透明性"]},
    ko:{sub:"대학 지원 · 어학 연수 · 장학금",detail:"고등학교·학부·대학원 지원 커버. 뉴질랜드 상위 8개교 및 호주 G8 특화. 어학 연수와 입학 지원 통합 서비스. 합격률 91%, 1200명 이상 지원.",svcs:["대학지원","고등학교유학","어학연수","장학금신청","입학후지원"],sk:["규정준수","서비스품질","성공률","요금투명성"]},
    es:{sub:"Universidad · Idioma · Becas",detail:"Solicitudes de secundaria, grado y posgrado. NZ top-8 y G8 Australia. Formación en idiomas e inscripción integradas. Tasa de aceptación del 91%, más de 1200 estudiantes.",svcs:["Universidad","Secundaria","Formación en Idiomas","Becas","Seguimiento de Ingreso"],sk:["Cumplimiento","Calidad de Servicio","Tasa de Éxito","Transparencia"]},
    fr:{sub:"Université · Langue · Bourses",detail:"Candidatures lycée, licence et master. NZ top-8 et G8 Australie. Formation linguistique et admissions intégrées. Taux d'acceptation 91%, plus de 1200 étudiants.",svcs:["Université","Lycée","Formation Linguistique","Bourses","Suivi Post-Inscription"],sk:["Conformité","Qualité de Service","Taux de Réussite","Transparence"]},
    ar:{sub:"جامعة · لغة · منح دراسية",detail:"طلبات الثانوية والبكالوريوس والدراسات العليا. أفضل 8 جامعات في نيوزيلندا وG8 أستراليا. تدريب لغوي وقبول متكاملان. نسبة قبول 91٪، أكثر من 1200 طالب.",svcs:["جامعة","ثانوية","تدريب لغوي","منح دراسية","متابعة ما بعد التسجيل"],sk:["الامتثال","جودة الخدمة","معدل النجاح","الشفافية"]},
  },
  4:{
    zh:{sub:"移民法 · 劳工 · 商业合同",detail:"拥有新西兰注册律师资格，专注移民法律事务、劳动争议及商业合同，提供中英双语法律服务，帮助华人客户有效维护自身权益，从业15年口碑稳定。",svcs:["移民法律","劳工纠纷","商业合同","遗产规划","公司注册"],sk:["合规性","服务质量","成功率","收费透明"]},
    zt:{sub:"移民法 · 勞工 · 商業合同",detail:"擁有新西蘭注冊律師資格，專注移民法律事務、勞動爭議及商業合同，提供中英雙語法律服務，幫助華人客戶有效維護自身權益，從業15年口碑穩定。",svcs:["移民法律","勞工糾紛","商業合同","遺產規劃","公司注冊"],sk:["合規性","服務質量","成功率","收費透明"]},
    en:{sub:"Immigration · Employment · Commercial",detail:"NZ registered barrister & solicitor. Immigration law, employment disputes and commercial contracts. Bilingual legal services for the Chinese community.",svcs:["Immigration Law","Employment","Commercial Contracts","Estate Planning","Company Registration"],sk:["Compliance","Service Quality","Success Rate","Transparency"]},
    ja:{sub:"移民法 · 労働 · 商業契約",detail:"NZ登録弁護士。移民法、労働紛争、商業契約を専門に扱い、バイリンガル法律サービスを提供。15年間の実績。",svcs:["移民法","労働紛争","商業契約","遺産計画","会社設立"],sk:["コンプライアンス","サービス品質","成功率","料金透明性"]},
    ko:{sub:"이민법 · 노동법 · 상업계약",detail:"뉴질랜드 등록 변호사. 이민법, 노동 분쟁, 상업 계약 전문. 이중언어 법률 서비스. 15년 경력.",svcs:["이민법","노동분쟁","상업계약","유산계획","회사설립"],sk:["규정준수","서비스품질","성공률","요금투명성"]},
    es:{sub:"Inmigración · Laboral · Contratos",detail:"Abogado registrado en NZ. Especializado en derecho migratorio, disputas laborales y contratos comerciales. Servicios jurídicos bilingües. 15 años de práctica.",svcs:["Derecho Migratorio","Disputas Laborales","Contratos Comerciales","Planificación Patrimonial","Registro de Empresa"],sk:["Cumplimiento","Calidad de Servicio","Tasa de Éxito","Transparencia"]},
    fr:{sub:"Immigration · Emploi · Contrats",detail:"Avocat inscrit en NZ. Droit de l'immigration, litiges du travail et contrats commerciaux. Services juridiques bilingues. 15 ans de pratique.",svcs:["Droit de l'Immigration","Litiges du Travail","Contrats Commerciaux","Planification Successorale","Création d'Entreprise"],sk:["Conformité","Qualité de Service","Taux de Réussite","Transparence"]},
    ar:{sub:"هجرة · عمالة · عقود تجارية",detail:"محامٍ مسجل في نيوزيلندا. متخصص في قانون الهجرة والنزاعات العمالية والعقود التجارية. خدمات قانونية ثنائية اللغة. 15 عاماً من الممارسة.",svcs:["قانون الهجرة","النزاعات العمالية","العقود التجارية","تخطيط التركات","تسجيل الشركة"],sk:["الامتثال","جودة الخدمة","معدل النجاح","الشفافية"]},
  },
  5:{
    zh:{sub:"Express Entry · 省提名 · 留学生移民",detail:"持有加拿大移民顾问监管委员会注册资质，精通联邦快速通道、各省提名项目及创业移民，从业10年，成功率稳定。",svcs:["Express Entry","省提名项目","留学生移民","创业签证","投资移民"],sk:["合规性","服务质量","成功率","收费透明"]},
    zt:{sub:"Express Entry · 省提名 · 留學生移民",detail:"持有加拿大移民顧問監管委員會注冊資質，精通聯邦快速通道、各省提名項目及創業移民，從業10年，成功率穩定。",svcs:["Express Entry","省提名項目","留學生移民","創業簽證","投資移民"],sk:["合規性","服務質量","成功率","收費透明"]},
    en:{sub:"Express Entry · PNP · Student-to-PR",detail:"CICC-regulated consultant. Federal Express Entry, Provincial Nominee Programs and startup visa. 10 years, consistent approval rates.",svcs:["Express Entry","Provincial Nominee","Study to PR","Start-up Visa","Investor"],sk:["Compliance","Service Quality","Success Rate","Transparency"]},
    ja:{sub:"エクスプレスエントリー · 州ノミネート · 留学生PR",detail:"カナダ移民コンサルタント規制委員会（CICC）認定コンサルタント。連邦エクスプレスエントリー、州ノミネートプログラム、スタートアップビザを専門。10年の実績。",svcs:["エクスプレスエントリー","州ノミネート","留学生からPR","スタートアップビザ","投資移民"],sk:["コンプライアンス","サービス品質","成功率","料金透明性"]},
    ko:{sub:"익스프레스 엔트리 · PNP · 유학생 영주권",detail:"CICC 공인 이민 컨설턴트. 연방 익스프레스 엔트리, 주 지명 프로그램, 창업 비자 전문. 10년 경력.",svcs:["익스프레스엔트리","주지명프로그램","유학생영주권","창업비자","투자이민"],sk:["규정준수","서비스품질","성공률","요금투명성"]},
    es:{sub:"Express Entry · PNP · Estudiante a PR",detail:"Consultor regulado por CICC. Express Entry federal, Programas Nominales Provinciales y visa de startup. 10 años, tasas de aprobación consistentes.",svcs:["Express Entry","Programa Provincial","Estudiante a PR","Visa Startup","Inversor"],sk:["Cumplimiento","Calidad de Servicio","Tasa de Éxito","Transparencia"]},
    fr:{sub:"Express Entry · PNP · Étudiant vers RP",detail:"Consultant réglementé par le CICC. Express Entry fédéral, Programmes des Candidats des Provinces et visa startup. 10 ans, taux d'approbation constants.",svcs:["Express Entry","Programme Provincial","Étudiant vers RP","Visa Startup","Investisseur"],sk:["Conformité","Qualité de Service","Taux de Réussite","Transparence"]},
    ar:{sub:"إكسبريس إنتري · PNP · الطالب إلى PR",detail:"مستشار مرخص من CICC. إكسبريس إنتري الفيدرالي، برامج المرشحين الإقليميين، تأشيرة الشركة الناشئة. 10 سنوات، معدلات موافقة ثابتة.",svcs:["إكسبريس إنتري","مرشح إقليمي","طالب إلى PR","تأشيرة شركة ناشئة","مستثمر"],sk:["الامتثال","جودة الخدمة","معدل النجاح","الشفافية"]},
  },
};

// Review texts per language
const RVL={
  1:{zh:"顾问全程中文跟进，签证顺利获批，非常安心。",zt:"顧問全程中文跟進，簽證順利獲批，非常安心。",en:"Advisor followed up throughout in Chinese. Visa approved — very reassuring.",ja:"担当者が終始日本語でフォローしてくれてビザが無事に承認されました。とても安心でした。",ko:"담당자가 처음부터 끝까지 따라와줘서 비자가 무사히 승인됐습니다. 매우 안심이 됐어요.",es:"El asesor me acompañó en todo momento. Visa aprobada sin problemas. Muy tranquilizador.",fr:"Le conseiller a suivi chaque étape. Visa approuvé sans problème. Très rassurant.",ar:"تابعني المستشار طوال العملية. تم الموافقة على التأشيرة بسلاسة. مطمئن جداً."},
  2:{zh:"买房全程中文沟通，合同逐字讲解，非常放心。",zt:"買房全程中文溝通，合同逐字講解，非常放心。",en:"Entire purchase in Chinese. Contract explained clause by clause. Very reassuring.",ja:"購入全プロセスを日本語でサポート。契約条項を一つずつ丁寧に説明してもらい、とても安心しました。",ko:"집 구입 전 과정을 한국어로 소통했습니다. 계약서를 조항별로 설명해줘서 매우 안심이 됐어요.",es:"Todo el proceso de compra en español. Contrato explicado cláusula por cláusula. Muy tranquilizador.",fr:"Tout le processus d'achat en français. Contrat expliqué clause par clause. Très rassurant.",ar:"عملية الشراء بالكامل بالعربية. شرح العقد بندًا بندًا. مطمئن جداً."},
  3:{zh:"孩子申请奥大很顺利，机构主动跟进每个节点。",zt:"孩子申請奧大很順利，機構主動跟進每個節點。",en:"My child's application went smoothly. Agency proactively followed up at every stage.",ja:"子どものオークランド大学への出願がスムーズに進みました。機関が各段階で積極的にフォローしてくれました。",ko:"아이의 오클랜드 대학 지원이 순조롭게 진행됐습니다. 기관이 각 단계마다 적극적으로 팔로업해줬어요.",es:"La solicitud de mi hijo fue sin problemas. La agencia hizo seguimiento proactivo en cada etapa.",fr:"La candidature de mon enfant s'est déroulée sans accroc. L'agence a assuré un suivi proactif à chaque étape.",ar:"سارت طلب ابني بسلاسة. قدّمت الوكالة متابعة استباقية في كل مرحلة."},
  4:{zh:"劳工纠纷两周内解决，李律师非常专业。",zt:"勞工糾紛兩週內解決，李律師非常專業。",en:"Employment dispute resolved in two weeks. Very professional.",ja:"労働紛争が2週間以内に解決されました。リー弁護士は非常にプロフェッショナルでした。",ko:"노동 분쟁이 2주 안에 해결됐습니다. 이 변호사님이 매우 전문적이었어요.",es:"Disputa laboral resuelta en dos semanas. Muy profesional.",fr:"Litige du travail résolu en deux semaines. Très professionnel.",ar:"تم حل النزاع العمالي في أسبوعين. محترف جداً."},
};

// Universal getter — picks right language for any merchant field
const mG=(m,field,lang)=>{
  const fb=lang==="zh"||lang==="zt"?"zh":"en";
  if(m._content) return(m._content[lang]?.[field])||(m._content[fb]?.[field])||"";
  return(ML[m.id]?.[lang]?.[field])||(ML[m.id]?.[fb]?.[field])||"";
};
const mScore=(m,lang)=>{
  const sk=mG(m,"sk",lang);
  const vals=Object.values(m.score);
  if(!sk||sk.length!==vals.length) return m.score;
  return Object.fromEntries(sk.map((k,i)=>[k,vals[i]]));
};
// Review text: DB reviews have .content, static have RVL lookup
const rvT=(r,lang)=>{
  if(r.content) return r.content; // DB review
  return RVL[r.mid]?.[lang]||RVL[r.mid]?.en||r.text||"";
};

const RVS=[
  {id:1,user:"王**",mid:1,rating:5,time:"2小时前"},
  {id:2,user:"张**",mid:2,rating:5,time:"昨天"},
  {id:3,user:"刘**",mid:3,rating:4,time:"3天前"},
  {id:4,user:"陈**",mid:4,rating:5,time:"1周前"},
];

const AQ=[
  {id:101,name:"华星会计事务所",catEn:"Accounting",region:"nz",tier:"cert",date:"2025-03-20",docs:{biz:true,prof:false,id:true,extra:false},status:"pending"},
  {id:102,name:"新移民法律援助",catEn:"Lawyer",region:"au",tier:"cert",date:"2025-03-19",docs:{biz:true,prof:true,id:true,extra:true},status:"pending"},
  {id:103,name:"悉尼华人医疗中心",catEn:"Medical",region:"au",tier:"free",date:"2025-03-18",docs:{biz:false,prof:false,id:false,extra:false},status:"pending"},
  {id:104,name:"Manchester Property Group",catEn:"Property",region:"uk",tier:"cert",date:"2025-03-17",docs:{biz:true,prof:true,id:true,extra:false},status:"pending"},
];

const SI={card:{background:"var(--card)",borderRadius:16,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"},inp:{width:"100%",background:"var(--bg)",border:"1px solid var(--line)",borderRadius:10,padding:"12px 14px",fontSize:14,outline:"none",color:"var(--ink)"}};

function Stars({n,sz=12}){return <span style={{display:"inline-flex",gap:1}}>{[1,2,3,4,5].map(i=><svg key={i} width={sz} height={sz} viewBox="0 0 24 24" fill={i<=n?"#FF9F0A":"#D1D1D6"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</span>;}
function Bdg({t,a,g}){return <span style={{display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:a?"rgba(232,0,61,0.09)":g?"rgba(52,199,89,0.1)":"rgba(60,60,67,0.07)",color:a?"var(--red)":g?"var(--green)":"var(--ink3)",border:a?"1px solid rgba(232,0,61,0.2)":g?"1px solid rgba(52,199,89,0.3)":"1px solid var(--line)"}}>{t}</span>;}
function Abar({pct}){const ref=useRef();const[go,setGo]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>e.isIntersecting&&setGo(true),{threshold:.5});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);return <div ref={ref} style={{height:3,background:"rgba(60,60,67,0.1)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:"var(--red)",width:go?`${pct}%`:"0%",transition:"width 1.1s cubic-bezier(.4,0,.2,1)"}}/></div>;}
function Logo({sz=20,dk}){return <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontStyle:"italic",fontWeight:700,fontSize:sz,color:dk?"var(--ink)":"#fff",letterSpacing:"-.01em",lineHeight:1}}>Life<span style={{color:"var(--red)"}}>1980</span></span>;}
function SH({lbl,ttl,lt}){return <div style={{marginBottom:22}}><p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>{lbl}</p><h2 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:700,color:lt?"#fff":"var(--ink)",letterSpacing:"-.02em"}}>{ttl}</h2></div>;}

// Navigation labels per language
const NAV_LABELS={
  zh:{property:"房产",jobs:"工作",immigration:"移民",education:"教育",lawyer:"律师",featured:"精选",dining:"餐饮",hotels:"酒店",travel:"旅游"},
  zt:{property:"房產",jobs:"工作",immigration:"移民",education:"教育",lawyer:"律師",featured:"精選",dining:"餐飲",hotels:"酒店",travel:"旅遊"},
  en:{property:"Property",jobs:"Jobs",immigration:"Immigration",education:"Education",lawyer:"Lawyer",featured:"Featured",dining:"Dining",hotels:"Hotels",travel:"Travel"},
  ja:{property:"不動産",jobs:"仕事",immigration:"移民",education:"教育",lawyer:"弁護士",featured:"おすすめ",dining:"グルメ",hotels:"ホテル",travel:"旅行"},
  ko:{property:"부동산",jobs:"취업",immigration:"이민",education:"교육",lawyer:"변호사",featured:"추천",dining:"맛집",hotels:"호텔",travel:"여행"},
  es:{property:"Propiedades",jobs:"Empleo",immigration:"Inmigración",education:"Educación",lawyer:"Abogado",featured:"Destacado",dining:"Gastronomía",hotels:"Hoteles",travel:"Viajes"},
  fr:{property:"Immobilier",jobs:"Emploi",immigration:"Immigration",education:"Éducation",lawyer:"Avocat",featured:"Sélection",dining:"Gastronomie",hotels:"Hôtels",travel:"Voyages"},
  ar:{property:"عقارات",jobs:"وظائف",immigration:"هجرة",education:"تعليم",lawyer:"محامي",featured:"مختارات",dining:"مطاعم",hotels:"فنادق",travel:"سياحة"},
};

// catI map: immigration=0, lawyer=1, property=2, education=3, jobs=4
const NAV_CATS=[
  {key:"immigration",catI:0,icon:"🌏"},
  {key:"lawyer",catI:1,icon:"⚖️"},
  {key:"property",catI:2,icon:"🏠"},
  {key:"education",catI:3,icon:"🎓"},
  {key:"jobs",catI:4,icon:"💼"},
];

function Nav({lang,setLang,region,setRegion,user,setPage,setCatFilter,onAuth}){
  const t=T[lang];const nl=NAV_LABELS[lang]||NAV_LABELS.en;
  const[lo,setLo]=useState(false);const[ro,setRo]=useState(false);const[featOpen,setFeatOpen]=useState(false);
  const rO=REGIONS.find(r=>r.c===region)||REGIONS[0];
  const goCategory=(catI)=>{setCatFilter(catI);setPage("home");setFeatOpen(false);};
  const featItems=[
    {icon:"🍜",key:"dining",pg:"featured-dining",desc:{zh:"华人餐厅推荐",zt:"華人餐廳推薦",en:"Chinese Restaurants",ja:"中華レストラン",ko:"중국 식당",es:"Restaurantes Chinos",fr:"Restaurants Chinois",ar:"مطاعم صينية"}},
    {icon:"🏨",key:"hotels",pg:"featured-hotels",desc:{zh:"精选酒店推荐",zt:"精選酒店推薦",en:"Curated Hotels",ja:"厳選ホテル",ko:"추천 호텔",es:"Hoteles Selectos",fr:"Hôtels Sélectionnés",ar:"فنادق مختارة"}},
    {icon:"✈️",key:"travel",pg:"travel",desc:{zh:"AI城市旅游指南",zt:"AI城市旅遊指南",en:"AI City Travel Guide",ja:"AI旅行ガイド",ko:"AI 여행 가이드",es:"Guía de Viaje IA",fr:"Guide Voyage IA",ar:"دليل سفر AI"}},
  ];
  return (
    <header style={{position:"fixed",top:0,left:0,right:0,zIndex:500,background:"rgba(18,18,20,0.97)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52,gap:8}}>
        <button onClick={()=>{setPage("home");setFeatOpen(false);}} style={{background:"none",border:"none",flexShrink:0}}><Logo sz={28}/></button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Featured - in top bar, uses position:fixed dropdown to avoid overflow clipping */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setFeatOpen(v=>!v);setRo(false);setLo(false);}} style={{background:featOpen?"rgba(255,214,10,0.15)":"rgba(255,255,255,0.06)",border:featOpen?"1px solid rgba(255,214,10,0.4)":"1px solid rgba(255,255,255,0.12)",color:featOpen?"#FFD60A":"rgba(255,255,255,0.85)",fontSize:13,fontWeight:700,padding:"6px 14px",borderRadius:980,display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
              ⭐ {nl.featured} <span style={{fontSize:9,opacity:.5}}>{featOpen?"▲":"▼"}</span>
            </button>
            {featOpen&&(
              <div style={{position:"fixed",top:60,left:"auto",background:"var(--card)",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.35)",padding:"8px",minWidth:230,zIndex:9999,border:"1px solid var(--line)"}}>
                <p style={{fontSize:11,fontWeight:700,color:"var(--ink4)",letterSpacing:".08em",textTransform:"uppercase",padding:"4px 10px 8px"}}>{nl.featured}</p>
                {featItems.map(item=>(
                  <button key={item.key} onClick={()=>{setFeatOpen(false);setPage(item.pg);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"none",border:"none",borderRadius:10,padding:"10px 12px",textAlign:"left",cursor:"pointer"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:"var(--ink)",marginBottom:1}}>{nl[item.key]}</div>
                      <div style={{fontSize:11,color:"var(--ink4)"}}>{item.desc[lang]||item.desc.en}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Region */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setRo(v=>!v);setLo(false);setFeatOpen(false);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:980,padding:"5px 11px",fontSize:13,color:"rgba(255,255,255,0.85)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              {rO.flag} <span style={{fontSize:9,opacity:.4}}>▾</span>
            </button>
            {ro&&(
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"var(--card)",borderRadius:14,boxShadow:"0 12px 48px rgba(0,0,0,0.28)",padding:6,minWidth:160,zIndex:700}} className="mo">
                {REGIONS.map(r=>(
                  <button key={r.c} onClick={()=>{setRegion(r.c);setRo(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:region===r.c?"var(--bg)":"none",border:"none",borderRadius:8,padding:"9px 12px",fontSize:13,fontWeight:region===r.c?700:400,color:"var(--ink)",textAlign:"left"}}>
                    <span>{r.flag}</span><span>{r[lang]||r.en}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Language */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setLo(v=>!v);setRo(false);setFeatOpen(false);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:980,padding:"5px 11px",fontSize:13,color:"rgba(255,255,255,0.85)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              {LANGS.find(l=>l.code===lang)?.flag} <span style={{fontSize:9,opacity:.4}}>▾</span>
            </button>
            {lo&&(
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"var(--card)",borderRadius:14,boxShadow:"0 12px 48px rgba(0,0,0,0.28)",padding:6,minWidth:150,zIndex:700}} className="mo">
                {LANGS.map(l=>(
                  <button key={l.code} onClick={()=>{setLang(l.code);setLo(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:lang===l.code?"var(--bg)":"none",border:"none",borderRadius:8,padding:"9px 12px",fontSize:13,fontWeight:lang===l.code?700:400,color:"var(--ink)"}}>
                    <span>{l.flag}</span><span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{width:1,height:16,background:"rgba(255,255,255,0.12)"}}/>
          {user
            ?<button onClick={()=>setPage("member")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:980,padding:"5px 12px",fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{user.split("@")[0]}</button>
            :<React.Fragment>
              <button onClick={onAuth} style={{background:"none",border:"none",color:"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600,padding:"5px 8px"}}>{t.login}</button>
              <button onClick={()=>setPage("pub")} style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:980,padding:"6px 14px",fontSize:13,fontWeight:700}}>{t.pub}</button>
            </React.Fragment>
          }
        </div>
      </div>
      {/* Category bar */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 16px",height:44,gap:2,overflowX:"auto"}}>
        {NAV_CATS.map(c=>(
          <button key={c.key} onClick={()=>goCategory(c.catI)}
            style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,padding:"6px 16px",borderRadius:8,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}>
            <span style={{fontSize:14}}>{c.icon}</span><span>{nl[c.key]}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

function AuthModal({t,onClose,onLogin}){
  const[mode,setMode]=useState("in");
  const[f,setF]=useState({email:"",pw:""});
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const u=(k,v)=>setF(p=>({...p,[k]:v}));

  const submit=async()=>{
    setLoading(true);setErr("");
    try{
      let res;
      if(mode==="in") res=await authSignIn(f.email,f.pw);
      else            res=await authSignUp(f.email,f.pw);
      if(res.error) throw res.error;
      const email=res.data?.user?.email||f.email;
      onLogin(email);
    }catch(e){
      setErr(e.message||"Authentication failed");
    }
    setLoading(false);
  };
  return <div style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div className="mo" style={{...SI.card,padding:"28px 24px",width:"100%",maxWidth:340,boxShadow:"0 24px 80px rgba(0,0,0,0.22)",position:"relative"}} onClick={e=>e.stopPropagation()}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",fontSize:20,color:"var(--ink4)"}}>×</button>
      <div style={{textAlign:"center",marginBottom:20}}><Logo sz={22} dk/><h2 style={{fontSize:18,fontWeight:700,marginTop:10}}>{mode==="in"?t.signIn:t.signUp}</h2></div>
      {mode==="up"&&<input placeholder={t.fullname} style={{...SI.inp,marginBottom:10}}/>}
      <input value={f.email} onChange={e=>u("email",e.target.value)} placeholder={t.email} type="email" style={{...SI.inp,marginBottom:10}}/>
      <input value={f.pw} onChange={e=>u("pw",e.target.value)} placeholder={t.pw} type="password" style={{...SI.inp,marginBottom:0}}/>
      {err&&<p style={{fontSize:12,color:"var(--red)",marginBottom:8,textAlign:"center"}}>{err}</p>}
      <button onClick={submit} disabled={loading} style={{width:"100%",background:"var(--red)",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontSize:15,fontWeight:700,marginTop:14,marginBottom:12,opacity:loading?0.7:1}}>
        {loading?"...":(mode==="in"?t.signIn:t.signUp)}
      </button>
      <p style={{textAlign:"center",fontSize:13,color:"var(--ink3)"}}>{mode==="in"?t.noAcc:t.hasAcc}{" "}<button onClick={()=>setMode(mode==="in"?"up":"in")} style={{background:"none",border:"none",color:"var(--blue)",fontWeight:700,fontSize:13}}>{mode==="in"?t.signUp:t.signIn}</button></p>
    </div>
  </div>;
}

function Home({lang,region,setPage,setDetail,initCatI}){
  const t=T[lang];const isZh=lang==="zh"||lang==="zt";
  const[q,setQ]=useState("");const[catI,setCatI]=useState(initCatI??null);
  useEffect(()=>{if(initCatI!==undefined)setCatI(initCatI);},[initCatI]);
  const[merchants,setMerchants]=useState(MS);
  const[loadingM,setLoadingM]=useState(true);
  const nm=m=>isZh?m.name:m.nameEn;
  const sb=m=>mG(m,"sub",lang);

  // Fetch from Supabase, fall back to static MS if empty/error
  useEffect(()=>{
    setLoadingM(true);
    fetchMerchants({region,catI,query:q}).then(({data,error})=>{
      if(!error&&data&&data.length>0) setMerchants(data);
      else setMerchants(MS.filter(m=>(region==="all"||m.regions.includes(region))&&(catI===null||m.catI===catI)&&(!q||m.name.toLowerCase().includes(q.toLowerCase())||m.nameEn.toLowerCase().includes(q.toLowerCase()))));
      setLoadingM(false);
    });
  },[region,catI,q]);

  const shown=merchants;
  return <main style={{paddingTop:100}}>
    {/* Compact hero - search bar only, no full screen */}
    <section style={{background:"#1C1C1E",padding:"32px 24px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:18,flexWrap:"wrap"}}>
          <div>
            <h1 style={{fontSize:"clamp(20px,2.5vw,28px)",fontWeight:800,color:"#fff",lineHeight:1.15,letterSpacing:"-.02em"}}>
              {t.h1} <span style={{color:"var(--red)"}}>{t.h2}</span>
            </h1>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:4}}>{t.heroTag}</p>
          </div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,overflow:"hidden",maxWidth:620}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&null} placeholder={t.sph} style={{flex:1,background:"transparent",border:"none",outline:"none",padding:"13px 16px",fontSize:14,color:"#fff"}}/>
          <button style={{background:"var(--red)",color:"#fff",border:"none",padding:"0 22px",fontSize:14,fontWeight:700,flexShrink:0}}>{t.sbtn}</button>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          {t.hot.map(tag=><button key={tag} onClick={()=>setQ(tag)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.65)",fontSize:12,borderRadius:980,padding:"5px 13px"}}>{tag}</button>)}
        </div>
      </div>
    </section>

    <section style={{background:"var(--bg)",padding:"40px 24px 0"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <SH lbl={t.featT} ttl={catI!==null?t.cats[catI]:t.featT}/>
        <div style={{...SI.card,borderRadius:16,overflow:"hidden",border:"1px solid var(--line)"}}>
          {(shown.length?shown:MS).map((m,i,a)=>(
            <button key={m.id} onClick={()=>{setDetail(m);setPage("detail");}} style={{display:"flex",alignItems:"center",gap:14,background:"none",border:"none",borderBottom:i<a.length-1?"1px solid var(--line)":"none",padding:"16px 18px",textAlign:"left",width:"100%"}}>
              <div style={{width:42,height:42,borderRadius:11,background:"rgba(60,60,67,0.07)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16,fontWeight:700,color:"var(--ink2)"}}>{nm(m)[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>{nm(m)}</span>
                  {m.cert&&<Bdg t={t.cert} a/>}
                </div>
                <div style={{fontSize:12,color:"var(--ink3)",marginBottom:4}}>{sb(m)}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><Stars n={Math.floor(m.rating)} sz={11}/><span style={{fontSize:12,fontWeight:700,color:"var(--ink2)"}}>{m.rating}</span><span style={{fontSize:11,color:"var(--ink4)"}}>· {m.rev}{t.revs} · {m.years}{t.yrs}</span></div>
              </div>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
          {shown.length===0&&<div style={{padding:"40px",textAlign:"center",color:"var(--ink3)",fontSize:14,background:"var(--card)"}}>{t.noResults}</div>}
        </div>
      </div>
    </section>

    <section style={{background:"#1C1C1E",padding:"72px 24px"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <SH lbl={t.rankT} ttl={t.rankS} lt/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:12}}>
          {(shown.length?shown:MS).slice(0,4).map((m,i)=>(
            <button key={m.id} onClick={()=>{setDetail(m);setPage("detail");}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 16px",textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontWeight:800,fontSize:26,color:i===0?"var(--red)":i===1?"#FF9F0A":"rgba(255,255,255,0.18)",lineHeight:1}}>{i+1}</span>{m.cert&&<span style={{fontSize:10,fontWeight:700,color:"var(--red)",border:"1px solid rgba(232,0,61,0.4)",padding:"2px 7px",borderRadius:4}}>{lang==="en"?"Cert":"认证"}</span>}</div>
              <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:5,lineHeight:1.3}}>{isZh?m.name:m.nameEn}</div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Stars n={Math.floor(m.rating)} sz={11}/><span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.55)"}}>{m.rating}</span></div>
            </button>
          ))}
        </div>
      </div>
    </section>

    <section style={{background:"var(--bg)",padding:"72px 24px"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <SH lbl={t.revT} ttl={t.revT}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:12}}>
          {RVS.map(r=>{const m=MS.find(x=>x.id===r.mid);const isZhR=lang==="zh"||lang==="zt";return(
            <div key={r.id} style={{...SI.card,borderRadius:16,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",background:"rgba(60,60,67,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"var(--ink2)"}}>{r.user[0]}</div><div><div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>{r.user}</div><Stars n={r.rating} sz={11}/></div></div>
                <span style={{fontSize:11,color:"var(--ink4)"}}>{r.time}</span>
              </div>
              <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.65,marginBottom:8}}>{rvT(r,lang)}</p>
              <span style={{fontSize:11,color:"var(--red)",fontWeight:700}}>→ {isZhR?m?.name:m?.nameEn}</span>
            </div>
          );})}
        </div>
      </div>
    </section>

    <section style={{background:"var(--bg)",padding:"0 24px 96px"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{background:"var(--ink)",borderRadius:24,padding:"52px 40px",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>{lang==="en"?"For Service Providers":"服务商入驻"}</p>
          <h2 style={{fontSize:28,fontWeight:700,color:"#fff",letterSpacing:"-.02em",marginBottom:10}}>{t.ctaT}</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.55)",maxWidth:360,margin:"0 auto 26px",lineHeight:1.65}}>{t.ctaS}</p>
          <button onClick={()=>setPage("pub")} style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:980,padding:"13px 32px",fontSize:15,fontWeight:700}}>{t.ctaB}</button>
        </div>
      </div>
    </section>

    <section style={{background:"var(--bg)",padding:"0 24px 40px"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#1C1C1E 0%,#2D1A1A 100%)",borderRadius:24,padding:"40px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>✈️ {lang==="zh"||lang==="zt"?"旅游模块":"Travel Module"}</p>
            <h2 style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"-.02em",marginBottom:8}}>{TT[lang]?.t||"City Travel Guide"}</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",maxWidth:340,lineHeight:1.6}}>{lang==="zh"?"到达任何城市，AI 实时生成景点、华人餐厅、实用信息":lang==="zt"?"到達任何城市，AI 實時生成景點、華人餐廳、實用資訊":"Arrive anywhere — AI generates attractions, Chinese restaurants and local tips in real time"}</p>
          </div>
          <button onClick={()=>setPage("travel")} style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:980,padding:"13px 28px",fontSize:14,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
            {TT[lang]?.btn||"Generate City Guide"} →
          </button>
        </div>
      </div>
    </section>

    <footer style={{background:"#1C1C1E",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"36px 24px 28px"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:24,marginBottom:28}}>
          <div>
            <div style={{marginBottom:10}}><Logo sz={22} /></div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6,maxWidth:280}}>{t.heroTag}</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:6}}>{t.heroSub} · {t.heroSlogan}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,textAlign:"right"}}>
            <a href="https://www.life1980.com" style={{fontSize:13,color:"rgba(255,255,255,0.5)",textDecoration:"none"}}>🌐 www.life1980.com</a>
            <a href="mailto:hello@life1980.com" style={{fontSize:13,color:"rgba(255,255,255,0.5)",textDecoration:"none"}}>✉️ hello@life1980.com</a>
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>{t.tagline} · © 2025 Life1980</p>
          <button onClick={()=>setPage("admin")} style={{background:"none",border:"none",fontSize:11,color:"rgba(255,255,255,0.2)",cursor:"pointer"}}>{t.adm}</button>
        </div>
      </div>
    </footer>
  </main>;
}

function Detail({m,lang,setPage}){
  const t=T[lang];const isZh=lang==="zh"||lang==="zt";
  const[reviews,setReviews]=useState([]);
  const[loadingR,setLoadingR]=useState(true);
  const sc=mScore(m,lang);

  useEffect(()=>{
    fetchReviews(m.id).then(({data})=>{
      // If DB has reviews use them, else fall back to static RVS
      if(data&&data.length>0) setReviews(data);
      else setReviews(RVS.filter(r=>r.mid===m.id));
      setLoadingR(false);
    });
  },[m.id]);
  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"48px 24px 40px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.75)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:24}}>{t.back}</button>
        <div style={{display:"flex",gap:8,marginBottom:12}}>{m.cert&&<Bdg t={t.cert} a/>}{m.local&&<Bdg t={t.local}/>}</div>
        <h1 style={{fontSize:"clamp(24px,4vw,40px)",fontWeight:700,color:"#fff",letterSpacing:"-.03em",marginBottom:4}}>{isZh?m.name:m.nameEn}</h1>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:24}}>{mG(m,"sub",lang)}</p>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          {[{v:m.rating,l:"★"},{v:`${m.years}${t.yrs}`,l:""},{v:`${m.cases}+`,l:t.cases},{v:m.rev,l:t.revs}].map((s,i)=><div key={i}><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{s.v}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{s.l}</div></div>)}
        </div>
      </div>
    </div>
    <div style={{background:"#FFFBF0",borderBottom:"1px solid #F0E098",padding:"9px 24px"}}><div style={{maxWidth:720,margin:"0 auto",fontSize:12,color:"#6B5200",fontWeight:600}}>⚠ {t.warn}</div></div>
    <div style={{maxWidth:720,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:18,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[{ttl:t.intro,body:<><p style={{fontSize:14,color:"var(--ink2)",lineHeight:1.78,marginBottom:16}}>{mG(m,"detail",lang)}</p><p style={{fontSize:11,fontWeight:700,color:"var(--ink4)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>{t.scope}</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{mG(m,"svcs",lang).map(s=><span key={s} style={{fontSize:13,padding:"6px 13px",borderRadius:980,background:"var(--bg)",color:"var(--ink2)",border:"1px solid var(--line)"}}>{s}</span>)}</div></>},
            {ttl:t.audit,body:<>{Object.entries(sc).map(([k,v])=><div key={k} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:"var(--ink2)",fontWeight:500}}>{k}</span><span style={{fontSize:13,fontWeight:700}}>{v}</span></div><Abar pct={v}/></div>)}</>},
            {ttl:t.revT,body:<>{(reviews.length?reviews:(RVS.filter(r=>r.mid===m.id).length?RVS.filter(r=>r.mid===m.id):RVS.slice(0,2))).map((r,i,a)=><div key={r.id||i} style={{paddingBottom:14,marginBottom:14,borderBottom:i<a.length-1?"1px solid var(--line)":"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:"50%",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>{(r.user_display||r.user||"?")[0]}</div><div><div style={{fontWeight:700,fontSize:13}}>{r.user_display||r.user}</div><Stars n={r.rating} sz={11}/></div></div><span style={{fontSize:11,color:"var(--ink4)"}}>{r.time||new Date(r.created_at||Date.now()).toLocaleDateString()}</span></div><p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.6,paddingLeft:40}}>{rvT(r,lang)}</p></div>)}</>}
          ].map(({ttl,body})=>(
            <div key={ttl} style={{...SI.card,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"13px 18px",borderBottom:"1px solid var(--line)"}}><h3 style={{fontSize:15,fontWeight:700}}>{ttl}</h3></div>
              <div style={{padding:"16px 18px"}}>{body}</div>
            </div>
          ))}
        </div>
        <div style={{position:"sticky",top:68,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{...SI.card,borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:"1px solid var(--line)"}}><p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:2}}>{t.contact}</p><h3 style={{fontSize:14,fontWeight:700}}>{t.callBtn}</h3></div>
            <div style={{padding:"12px 16px"}}>{[{icon:"📞",l:t.fTel,v:m.tel},{icon:"💬",l:"WeChat",v:m.wx}].map(c=><div key={c.l} style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}><span style={{fontSize:17}}>{c.icon}</span><div><div style={{fontSize:10,color:"var(--ink4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>{c.l}</div><div style={{fontSize:13,fontWeight:600}}>{c.v}</div></div></div>)}</div>
            <div style={{padding:"0 12px 12px",display:"flex",flexDirection:"column",gap:8}}>
              <button style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontSize:14,fontWeight:700}}>{t.callBtn}</button>
              <button style={{background:"var(--bg)",color:"var(--ink)",border:"1px solid var(--line)",borderRadius:10,padding:"11px 0",fontSize:14,fontWeight:700}}>{t.planBtn}</button>
            </div>
          </div>
          <div style={{...SI.card,borderRadius:16,padding:"14px 16px"}}>
            <p style={{fontSize:12,fontWeight:700,color:"var(--ink2)",marginBottom:10}}>{t.audit}</p>
            {t.auditItems.map(item=><div key={item} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:16,height:16,borderRadius:"50%",background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span style={{fontSize:12,color:"var(--ink2)",fontWeight:500}}>{item}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function Publish({lang,setPage,user}){
  const t=T[lang];
  const[tier,setTier]=useState("free");
  const[f,setF]=useState({name:"",cat:"",desc:"",tel:"",wx:""});
  const[docs,setDocs]=useState({biz:false,prof:false,id:false,extra:false});
  const[done,setDone]=useState(false);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const u=(k,v)=>setF(p=>({...p,[k]:v}));
  const dp=[docs.biz,docs.prof,docs.id,docs.extra].filter(Boolean).length*25;

  const handleSubmit=async()=>{
    if(!f.name.trim()){setErr(t.fReq);return;}
    setLoading(true);setErr("");
    const payload={
      company_name:f.name, description:f.desc,
      tel:f.tel, wechat:f.wx, tier,
      docs_biz:docs.biz, docs_prof:docs.prof,
      docs_id:docs.id, docs_extra:docs.extra,
    };
    const{error}=await submitApplication(payload, user?.id||null);
    if(error){setErr(error.message);setLoading(false);return;}
    setDone(true);setLoading(false);
  };
  if(done)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px",background:"var(--bg)"}}><div style={{textAlign:"center",maxWidth:340}}><div style={{width:56,height:56,borderRadius:"50%",background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em",marginBottom:10}}>{t.doneT}</h2><p style={{color:"var(--ink2)",fontSize:14,lineHeight:1.7,marginBottom:24}}>{t.doneS}</p><button onClick={()=>setPage("home")} style={{background:"var(--ink)",color:"#fff",border:"none",borderRadius:980,padding:"12px 26px",fontSize:14,fontWeight:700}}>{t.backHome}</button></div></div>;
  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"48px 24px 40px"}}><div style={{maxWidth:560,margin:"0 auto"}}>
      <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.75)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:24}}>{t.back}</button>
      <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{lang==="en"?"Service Provider":"服务商入驻"}</p>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:700,color:"#fff",letterSpacing:"-.03em",marginBottom:8}}>{t.pubT}</h1>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>{t.pubS}</p>
    </div></div>
    <div style={{maxWidth:560,margin:"0 auto",padding:"32px 24px"}}>
      <p style={{fontSize:13,fontWeight:700,color:"var(--ink2)",marginBottom:10}}>{t.planT}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
        {[{id:"free",l:t.freeL,p:t.freeP,d:t.freeD},{id:"cert",l:t.certL,p:t.certP,d:t.certD,hi:true}].map(pl=>(
          <button key={pl.id} onClick={()=>setTier(pl.id)} style={{padding:16,borderRadius:14,textAlign:"left",background:tier===pl.id&&pl.hi?"var(--ink)":"var(--card)",border:tier===pl.id?`1.5px solid ${pl.hi?"var(--red)":"var(--ink)"}`:"1px solid var(--line)",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontWeight:700,fontSize:14,color:tier===pl.id&&pl.hi?"#fff":"var(--ink)",marginBottom:3}}>{pl.l}</div>
            <div style={{fontWeight:800,fontSize:17,color:pl.hi?"var(--red)":"var(--ink3)",marginBottom:4}}>{pl.p}</div>
            <div style={{fontSize:12,color:tier===pl.id&&pl.hi?"rgba(255,255,255,0.5)":"var(--ink3)"}}>{pl.d}</div>
          </button>
        ))}
      </div>
      <div style={{...SI.card,borderRadius:16,padding:22,display:"flex",flexDirection:"column",gap:16}}>
        <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><label style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{t.fName}</label><span style={{fontSize:11,color:"var(--red)",fontWeight:600}}>{t.fReq}</span></div><input value={f.name} onChange={e=>u("name",e.target.value)} placeholder={lang==="en"?"e.g. ABC Immigration":"如：ABC 移民顾问"} style={SI.inp}/></div>
        <div><label style={{fontSize:13,fontWeight:700,color:"var(--ink)",display:"block",marginBottom:7}}>{t.fType}</label><select value={f.cat} onChange={e=>u("cat",e.target.value)} style={{...SI.inp,appearance:"none"}}><option value="">{t.fTypePH}</option>{t.cats.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={{fontSize:13,fontWeight:700,color:"var(--ink)",display:"block",marginBottom:7}}>{t.fDesc}</label><textarea value={f.desc} onChange={e=>u("desc",e.target.value)} placeholder={t.fDescPH} style={{...SI.inp,height:84,resize:"vertical",lineHeight:1.6}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:13,fontWeight:700,color:"var(--ink)",display:"block",marginBottom:7}}>{t.fTel}</label><input value={f.tel} onChange={e=>u("tel",e.target.value)} placeholder="+64 9 XXX" style={SI.inp}/></div>
          <div><label style={{fontSize:13,fontWeight:700,color:"var(--ink)",display:"block",marginBottom:7}}>{t.fWx}</label><input value={f.wx} onChange={e=>u("wx",e.target.value)} placeholder="WeChat ID" style={SI.inp}/></div>
        </div>
        <div style={{borderTop:"1px solid var(--line)",paddingTop:16}}>
          <p style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:4}}>{t.docsT}</p>
          <p style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>{t.docsS}</p>
          {[{k:"biz",l:t.doc1},{k:"prof",l:t.doc2},{k:"id",l:t.doc3},{k:"extra",l:t.doc4}].map(d=>(
            <div key={d.k} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--line)"}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:2}}>{d.l}</div><div style={{fontSize:11,color:docs[d.k]?"var(--green)":"var(--ink4)"}}>{docs[d.k]?(lang==="en"?"✓ Submitted":"✓ 已提交"):(lang==="en"?"Improves trust":"提升信用等级")}</div></div>
              <button onClick={()=>setDocs(p=>({...p,[d.k]:!p[d.k]}))} style={{background:docs[d.k]?"rgba(52,199,89,0.1)":"var(--bg)",border:`1px solid ${docs[d.k]?"var(--green)":"var(--line)"}`,borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,color:docs[d.k]?"var(--green)":"var(--ink2)",flexShrink:0,whiteSpace:"nowrap"}}>{docs[d.k]?t.uploaded:t.upload}</button>
            </div>
          ))}
          <div style={{marginTop:14,background:"var(--bg)",borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:12,fontWeight:700}}>{t.trustLv}</span><span style={{fontSize:13,fontWeight:800,color:"var(--red)"}}>{dp}%</span></div>
            <div style={{height:5,background:"rgba(60,60,67,0.1)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:"var(--red)",width:`${dp}%`,transition:"width .4s"}}/></div>
          </div>
        </div>
        <p style={{fontSize:11,color:"var(--ink3)",lineHeight:1.6}}>{t.terms}</p>
        {err&&<p style={{fontSize:12,color:"var(--red)",marginBottom:8}}>{err}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontSize:15,fontWeight:700,opacity:loading?0.7:1}}>
          {loading?"...":(t.submitBtn)}
        </button>
      </div>
    </div>
  </div>;
}

function Member({lang,user,setPage,onLogout}){
  const t=T[lang];
  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"48px 24px 40px"}}><div style={{maxWidth:500,margin:"0 auto"}}>
      <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.75)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:24}}>{t.back}</button>
      <div style={{width:52,height:52,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",fontWeight:700,marginBottom:14}}>{user[0].toUpperCase()}</div>
      <h1 style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:"-.02em",marginBottom:4}}>{t.welcome}</h1>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>{user}</p>
    </div></div>
    <div style={{maxWidth:500,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{...SI.card,borderRadius:16,overflow:"hidden"}}>
        {[{icon:"🔖",l:t.bkm,n:3},{icon:"⭐",l:t.myrev,n:2},{icon:"⚙️",l:t.settings}].map((item,i,a)=>(
          <div key={item.l} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 18px",borderBottom:i<a.length-1?"1px solid var(--line)":"none"}}>
            <span style={{fontSize:19,width:32,textAlign:"center"}}>{item.icon}</span>
            <span style={{flex:1,fontSize:15,fontWeight:600,color:"var(--ink)"}}>{item.l}</span>
            {item.n&&<span style={{background:"var(--red)",color:"#fff",borderRadius:980,fontSize:11,fontWeight:700,padding:"2px 8px"}}>{item.n}</span>}
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{width:"100%",marginTop:14,background:"var(--card)",border:"1px solid var(--line)",borderRadius:12,padding:"13px 0",fontSize:14,fontWeight:700,color:"var(--red)"}}>{t.logout}</button>
    </div>
  </div>;
}

function Admin({lang,setPage}){
  const t=T[lang];
  const[q,setQ]=useState(AQ);
  const[loading,setLoading]=useState(true);
  const sc={pending:"#FF9F0A",approved:"var(--green)",rejected:"var(--red)"};

  useEffect(()=>{
    fetchApplications().then(({data,error})=>{
      if(!error&&data&&data.length>0) setQ(data.map(a=>({
        id:a.id, name:a.company_name, catEn:a.cat_en||"",
        region:a.region||"", tier:a.tier||"free",
        date:(a.submitted_at||"").slice(0,10),
        docs:{biz:a.docs_biz,prof:a.docs_prof,id:a.docs_id,extra:a.docs_extra},
        status:a.status||"pending"
      })));
      setLoading(false);
    });
  },[]);

  const act=async(id,status)=>{
    setQ(p=>p.map(x=>x.id===id?{...x,status}:x));
    await updateAppStatus(id,status);
  };
  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"48px 24px 40px"}}><div style={{maxWidth:840,margin:"0 auto"}}>
      <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.75)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:24}}>{t.back}</button>
      <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>K1980</p>
      <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,color:"#fff",letterSpacing:"-.03em",marginBottom:6}}>{t.adminT}</h1>
      <p style={{fontSize:14,color:"rgba(255,255,255,0.45)"}}>{t.adminS}</p>
    </div></div>
    <div style={{maxWidth:840,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {[{l:t.pending,s:"pending"},{l:t.approved,s:"approved"},{l:t.rejected,s:"rejected"}].map(({l,s})=>(
          <div key={s} style={{...SI.card,borderRadius:14,padding:18}}><div style={{fontSize:26,fontWeight:800,color:sc[s]}}>{q.filter(x=>x.status===s).length}</div><div style={{fontSize:13,fontWeight:600,color:"var(--ink3)",marginTop:4}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {q.map(app=>{const reg=REGIONS.find(r=>r.c===app.region);return(
          <div key={app.id} style={{...SI.card,borderRadius:16,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>{app.name}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:`${sc[app.status]}18`,color:sc[app.status],border:`1px solid ${sc[app.status]}40`}}>{t[app.status]}</span>
                </div>
                <div style={{fontSize:12,color:"var(--ink3)"}}>{reg?.flag} {reg?.[lang]||reg?.en} · {app.catEn} · {app.date} · {app.tier==="cert"?t.certL:t.freeL}</div>
              </div>
              {app.status==="pending"&&<div style={{display:"flex",gap:8}}>
                <button onClick={()=>act(app.id,"approved")} style={{background:"rgba(52,199,89,0.1)",border:"1px solid rgba(52,199,89,0.3)",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:700,color:"var(--green)"}}>{t.appBtn}</button>
                <button onClick={()=>act(app.id,"rejected")} style={{background:"rgba(232,0,61,0.07)",border:"1px solid rgba(232,0,61,0.2)",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:700,color:"var(--red)"}}>{t.rejBtn}</button>
              </div>}
            </div>
            <div style={{background:"var(--bg)",borderRadius:10,padding:"10px 12px"}}>
              <p style={{fontSize:11,fontWeight:700,color:"var(--ink3)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>{t.docsLbl}</p>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {[{k:"biz",l:"Biz"},{k:"prof",l:"Prof"},{k:"id",l:"ID"},{k:"extra",l:"Extra"}].map(d=>(
                  <span key={d.k} style={{fontSize:11,padding:"3px 9px",borderRadius:20,fontWeight:600,background:app.docs[d.k]?"rgba(52,199,89,0.1)":"rgba(60,60,67,0.06)",color:app.docs[d.k]?"var(--green)":"var(--ink4)",border:`1px solid ${app.docs[d.k]?"rgba(52,199,89,0.3)":"var(--line)"}`}}>{app.docs[d.k]?"✓ ":""}{d.l}</span>
                ))}
              </div>
            </div>
          </div>
        );})}
      </div>
    </div>
  </div>;
}

const TT={
  zh:{t:"旅游助手",s:"AI 驱动 · 实时本地信息",ph:"输入城市，如：奥克兰、悉尼、多伦多…",loc:"📍 自动定位",btn:"生成城市指南",load:"AI 正在搜索本地信息…",tabs:["景点推荐","华人餐厅","实用信息","华人服务"],tip:"K1980 AI 实时网络搜索生成，仅供参考。",reset:"换个城市",st:"当地华人服务商",ss:"在此城市注册的认证服务商",empty:"输入城市，AI 为你生成专属旅游指南"},
  zt:{t:"旅遊助手",s:"AI 驅動 · 實時本地資訊",ph:"輸入城市，如：奧克蘭、悉尼、多倫多…",loc:"📍 自動定位",btn:"生成城市指南",load:"AI 正在搜尋本地資訊…",tabs:["景點推薦","華人餐廳","實用資訊","華人服務"],tip:"K1980 AI 實時網絡搜索生成，僅供參考。",reset:"換個城市",st:"當地華人服務商",ss:"在此城市注冊的認證服務商",empty:"輸入城市，AI 為你生成專屬旅遊指南"},
  en:{t:"City Travel Guide",s:"AI-powered · Real-time local info",ph:"Enter a city, e.g. Auckland, Sydney, Toronto…",loc:"📍 Detect Location",btn:"Generate City Guide",load:"AI is searching local info…",tabs:["Attractions","Chinese Restaurants","Practical Info","Chinese Services"],tip:"Generated by K1980 AI with real-time web search. For reference only.",reset:"Try Another City",st:"Local Chinese Providers",ss:"Certified providers registered in this city",empty:"Enter a city above and AI will generate your guide"},
  ja:{t:"旅行ガイド",s:"AI搭載 · リアルタイム地元情報",ph:"都市名を入力（例：オークランド、シドニー）",loc:"📍 位置を検出",btn:"都市ガイドを生成",load:"AIがローカル情報を検索中…",tabs:["観光スポット","中華料理","実用情報","華人サービス"],tip:"K1980 AIによるリアルタイム検索。参考情報。",reset:"別の都市",st:"地域の華人サービス",ss:"この都市に登録された認定業者",empty:"都市を入力してください"},
  ko:{t:"여행 가이드",s:"AI 기반 · 실시간 현지 정보",ph:"도시 이름 입력 (예: 오클랜드, 시드니)",loc:"📍 위치 감지",btn:"도시 가이드 생성",load:"AI가 현지 정보 검색 중…",tabs:["관광명소","중국 식당","실용 정보","화인 서비스"],tip:"K1980 AI 실시간 검색 기반. 참고용.",reset:"다른 도시",st:"현지 화인 서비스",ss:"이 도시 등록 인증 업체",empty:"도시를 입력하세요"},
  es:{t:"Guía de Viaje",s:"Impulsado por IA · Info local en tiempo real",ph:"Ciudad, p.ej. Auckland, Sídney, Toronto…",loc:"📍 Detectar ubicación",btn:"Generar guía",load:"IA buscando info local…",tabs:["Atracciones","Restaurantes Chinos","Info Práctica","Servicios Chinos"],tip:"Generado por K1980 IA. Solo referencial.",reset:"Otra ciudad",st:"Proveedores Chinos Locales",ss:"Proveedores certificados en esta ciudad",empty:"Ingresa una ciudad arriba"},
  fr:{t:"Guide de Voyage",s:"Propulsé par IA · Info locale en temps réel",ph:"Ville, ex. Auckland, Sydney, Toronto…",loc:"📍 Détecter la position",btn:"Générer le guide",load:"L'IA recherche des infos locales…",tabs:["Attractions","Restaurants Chinois","Info Pratique","Services Chinois"],tip:"Généré par K1980 IA. À titre indicatif.",reset:"Autre ville",st:"Prestataires Chinois Locaux",ss:"Prestataires certifiés dans cette ville",empty:"Entrez une ville ci-dessus"},
  ar:{t:"دليل السفر",s:"مدعوم بالذكاء الاصطناعي · معلومات فورية",ph:"أدخل مدينة، مثل: أوكلاند، سيدني…",loc:"📍 تحديد الموقع",btn:"إنشاء دليل المدينة",load:"الذكاء الاصطناعي يبحث…",tabs:["المعالم","المطاعم الصينية","معلومات عملية","خدمات صينية"],tip:"تم إنشاؤه بواسطة K1980 AI. للاستئناس فقط.",reset:"مدينة أخرى",st:"مزودو الخدمة المحليون",ss:"مزودون معتمدون في هذه المدينة",empty:"أدخل مدينة أعلاه"},
};

function Travel({lang,setPage}){
  const tt=TT[lang]||TT.en;
  const[city,setCity]=useState("");const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(null);const[tab,setTab]=useState(0);
  const[err,setErr]=useState("");

  const detect=()=>{
    if(!navigator.geolocation){setErr("Geolocation not supported");return;}
    navigator.geolocation.getCurrentPosition(async pos=>{
      const{latitude:lat,longitude:lng}=pos.coords;
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d=await r.json();
        setCity(d.address?.city||d.address?.town||d.address?.county||"");
      }catch{setErr("Could not detect city");}
    },()=>setErr("Location access denied"));
  };

  const generate=async()=>{
    if(!city.trim())return;
    setLoading(true);setErr("");setResult(null);
    try{
      // Calls our secure Vercel serverless function — API key never exposed to browser
      const res=await fetch("/api/travel",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({city,lang})
      });
      if(!res.ok) throw new Error("Server error");
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setResult(data);
    }catch(e){setErr(e.message||"AI generation failed. Please try again.");}
    setLoading(false);
  };

  const tabs=tt.tabs;const icons=["🏛","🍜","ℹ️","🏢"];

  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"52px 24px 44px"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:24}}>← {T[lang]?.back||"Back"}</button>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:28}}>✈️</span>
          <div><p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase"}}>K1980</p>
          <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,color:"#fff",letterSpacing:"-.02em"}}>{tt.t}</h1></div>
        </div>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",marginBottom:28}}>{tt.s}</p>
        {!result&&<>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()} placeholder={tt.ph} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"13px 16px",fontSize:14,color:"#fff",outline:"none"}}/>
            <button onClick={detect} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"0 14px",fontSize:13,color:"rgba(255,255,255,0.7)",whiteSpace:"nowrap"}}>{tt.loc}</button>
          </div>
          <button onClick={generate} disabled={!city.trim()||loading} style={{width:"100%",background:city.trim()?"var(--red)":"rgba(255,255,255,0.1)",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontSize:15,fontWeight:700}}>
            {loading?tt.load:tt.btn}
          </button>
          {err&&<p style={{color:"#FF6B6B",fontSize:13,marginTop:8,textAlign:"center"}}>{err}</p>}
        </>}
        {result&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div><div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{result.city}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:4,maxWidth:400}}>{result.summary}</div></div>
          <button onClick={()=>{setResult(null);setCity("");}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:980,padding:"7px 16px",fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>{tt.reset}</button>
        </div>}
      </div>
    </div>

    {loading&&<div style={{maxWidth:700,margin:"60px auto",padding:"0 24px",textAlign:"center"}}>
      <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid var(--line)",borderTopColor:"var(--red)",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:"var(--ink3)",fontSize:14}}>{tt.load}</p>
    </div>}

    {result&&<div style={{maxWidth:700,margin:"0 auto",padding:"28px 24px"}}>
      <div style={{display:"flex",gap:8,marginBottom:22,overflowX:"auto",paddingBottom:2}}>
        {tabs.map((tb,i)=><button key={i} onClick={()=>setTab(i)} style={{padding:"8px 16px",borderRadius:980,background:tab===i?"var(--ink)":"var(--card)",color:tab===i?"#fff":"var(--ink2)",border:tab===i?"none":"1px solid var(--line)",fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{icons[i]} {tb}</button>)}
      </div>

      {tab===0&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {(result.attractions||[]).map((a,i)=><div key={i} style={{...SI.card,borderRadius:16,padding:"16px 18px",display:"flex",gap:12}}>
          <span style={{fontSize:26,flexShrink:0}}>{a.emoji||"🏛"}</span>
          <div><div style={{fontWeight:700,fontSize:14,color:"var(--ink)",marginBottom:3}}>{a.name}</div>
          <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.5,marginBottom:5}}>{a.desc}</p>
          <div style={{fontSize:11,color:"var(--red)",fontWeight:600}}>💡 {a.tip}</div></div>
        </div>)}
      </div>}

      {tab===1&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {(result.restaurants||[]).map((r,i)=><div key={i} style={{...SI.card,borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:26,flexShrink:0}}>{r.emoji||"🍜"}</span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:"var(--ink)",marginBottom:1}}>{r.name}</div>
          <div style={{fontSize:12,color:"var(--ink3)"}}>{r.cuisine} · {r.area}</div></div>
          <div style={{fontSize:13,fontWeight:700,color:"var(--green)",flexShrink:0}}>{r.priceRange}</div>
        </div>)}
      </div>}

      {tab===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {(result.practical||[]).map((p,i)=><div key={i} style={{...SI.card,borderRadius:16,padding:"14px 18px",display:"flex",gap:12}}>
          <span style={{fontSize:20,flexShrink:0}}>{p.emoji||"ℹ️"}</span>
          <div><div style={{fontWeight:700,fontSize:13,color:"var(--ink)",marginBottom:2}}>{p.category}</div>
          <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.5}}>{p.info}</p></div>
        </div>)}
      </div>}

      {tab===3&&<>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {(result.services||[]).map((s,i)=><div key={i} style={{...SI.card,borderRadius:16,padding:"14px 18px",display:"flex",gap:12}}>
            <span style={{fontSize:20,flexShrink:0}}>{s.emoji||"🏢"}</span>
            <div><div style={{fontWeight:700,fontSize:13,color:"var(--ink)",marginBottom:2}}>{s.type}</div>
            <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.5}}>{s.note}</p></div>
          </div>)}
        </div>
        <div style={{background:"var(--ink)",borderRadius:16,padding:"18px"}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>K1980</p>
          <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:3}}>{tt.st}</div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:14}}>{tt.ss}</p>
          {MS.slice(0,3).map(m=>{const isZh=lang==="zh"||lang==="zt";return(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)",flexShrink:0}}>{(isZh?m.name:m.nameEn)[0]}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{isZh?m.name:m.nameEn}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{mG(m,"sub",lang)}</div></div>
              <Stars n={Math.floor(m.rating)} sz={10}/>
            </div>
          );})}
        </div>
      </>}
      <p style={{fontSize:11,color:"var(--ink4)",marginTop:16,textAlign:"center"}}>{tt.tip}</p>
    </div>}

    {!result&&!loading&&<div style={{maxWidth:700,margin:"60px auto",padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:12}}>🗺️</div>
      <p style={{color:"var(--ink3)",fontSize:14,fontWeight:500}}>{tt.empty}</p>
    </div>}
  </div>;
}

// ── FEATURED PAGE (餐饮 / 酒店 / 旅游) ──
function Featured({lang,setPage,initTab}){
  const nl=NAV_LABELS[lang]||NAV_LABELS.en;
  const[tab,setTab]=useState(initTab||"dining");
  const isZh=lang==="zh"||lang==="zt";
  const tabs=[{key:"dining",icon:"🍜"},{key:"hotels",icon:"🏨"},{key:"travel",icon:"✈️"}];

  const diningItems=[
    {name:isZh?"金龙海鲜酒楼":"Golden Dragon Seafood",area:isZh?"奥克兰市中心":"Auckland CBD",cuisine:isZh?"粤式海鲜":"Cantonese Seafood",rating:4.8,price:"$$",desc:isZh?"正宗粤式早茶与海鲜，华人聚会首选。":"Authentic dim sum and seafood, perfect for family gatherings."},
    {name:isZh?"四川麻辣香锅":"Sichuan Spice House",area:isZh?"皇后街":"Queen St",cuisine:isZh?"川菜":"Sichuan",rating:4.7,price:"$$",desc:isZh?"地道川菜，麻辣鲜香，思乡首选。":"Authentic Sichuan flavours. A must for spice lovers."},
    {name:isZh?"台湾牛肉面馆":"Taiwan Beef Noodle",area:isZh?"北岸":"North Shore",cuisine:isZh?"台湾料理":"Taiwanese",rating:4.6,price:"$",desc:isZh?"台式红烧牛肉面，汤底浓郁，分量十足。":"Classic Taiwanese braised beef noodles with rich broth."},
    {name:isZh?"上海点心坊":"Shanghai Dim Sum",area:isZh?"帕内尔":"Parnell",cuisine:isZh?"沪式点心":"Shanghainese",rating:4.5,price:"$",desc:isZh?"小笼包、生煎包，上海风味原汁原味。":"Soup dumplings and pan-fried bao. Genuine Shanghai taste."},
  ];

  const hotelItems=[
    {name:isZh?"索菲特奥克兰酒店":"Sofitel Auckland Viaduct Harbour",area:isZh?"维亚达克港":"Viaduct Harbour",stars:5,price:"$$$",desc:isZh?"法式奢华，海港景致，距市中心步行可达。":"French luxury with harbour views. Walking distance to CBD."},
    {name:isZh?"大使馆公寓酒店":"The Quadrant Hotel",area:isZh?"市中心":"City Centre",stars:4,price:"$$",desc:isZh?"宽敞套房，设施齐全，中文服务，华人推荐。":"Spacious suites with full facilities. Chinese-speaking staff available."},
    {name:isZh?"皇家大道酒店":"Rydges Auckland",area:isZh?"市中心":"City Centre",stars:4,price:"$$",desc:isZh?"性价比高，位置绝佳，商务出行首选。":"Great value, central location. Popular with business travellers."},
    {name:isZh?"斯凯城赌场酒店":"SkyCity Hotel",area:isZh?"天空塔旁":"Sky Tower",stars:4,price:"$$",desc:isZh?"毗邻天空塔，购物娱乐一步到位。":"Next to Sky Tower. Shopping and entertainment on your doorstep."},
  ];

  return <div style={{background:"var(--bg)",minHeight:"100vh",paddingTop:100}}>
    <div style={{background:"#1C1C1E",padding:"40px 24px 32px"}}>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:700,marginBottom:20}}>← {T[lang]?.back||"Back"}</button>
        <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>K1980</p>
        <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:700,color:"#fff",letterSpacing:"-.02em",marginBottom:16}}>
          ⭐ {nl.featured}
        </h1>
        {/* Tabs */}
        <div style={{display:"flex",gap:8}}>
          {tabs.map(tb=>(
            <button key={tb.key} onClick={()=>setTab(tb.key)}
              style={{padding:"8px 20px",borderRadius:980,background:tab===tb.key?"var(--red)":"rgba(255,255,255,0.08)",color:"#fff",border:"none",fontSize:13,fontWeight:700,transition:"all .18s"}}>
              {tb.icon} {nl[tb.key]}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 24px"}}>
      {/* Dining */}
      {tab==="dining"&&<>
        <div style={{marginBottom:20}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>🍜 {nl.dining}</p>
          <h2 style={{fontSize:22,fontWeight:700,letterSpacing:"-.02em"}}>{isZh?"华人餐厅推荐":lang==="zt"?"華人餐廳推薦":"Chinese Restaurant Guide"}</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {diningItems.map((r,i)=>(
            <div key={i} style={{...SI.card,borderRadius:16,padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:"rgba(232,0,61,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🍜</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>{r.name}</span>
                    <span style={{fontSize:12,background:"var(--bg)",padding:"2px 8px",borderRadius:980,color:"var(--ink3)",fontWeight:600}}>{r.cuisine}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--ink4)",marginBottom:5}}>📍 {r.area} · {r.price}</div>
                  <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.5}}>{r.desc}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>★ {r.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* Hotels */}
      {tab==="hotels"&&<>
        <div style={{marginBottom:20}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>🏨 {nl.hotels}</p>
          <h2 style={{fontSize:22,fontWeight:700,letterSpacing:"-.02em"}}>{isZh?"精选酒店推荐":lang==="zt"?"精選酒店推薦":"Curated Hotel Guide"}</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {hotelItems.map((h,i)=>(
            <div key={i} style={{...SI.card,borderRadius:16,padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:"rgba(0,113,227,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🏨</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>{h.name}</span>
                    <span style={{fontSize:12,color:"#FF9F0A",fontWeight:700}}>{"★".repeat(h.stars)}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--ink4)",marginBottom:5}}>📍 {h.area} · {h.price}</div>
                  <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.5}}>{h.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* Travel - redirect to Travel page */}
      {tab==="travel"&&<div style={{textAlign:"center",padding:"60px 0"}}>
        <div style={{fontSize:64,marginBottom:16}}>✈️</div>
        <h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em",marginBottom:12}}>{nl.travel}</h2>
        <p style={{color:"var(--ink3)",fontSize:15,marginBottom:28,maxWidth:380,margin:"0 auto 28px"}}>
          {isZh?"输入城市，AI 实时生成景点、华人餐厅、实用攻略":lang==="zt"?"輸入城市，AI 實時生成景點、華人餐廳、實用攻略":"Enter any city and AI generates attractions, restaurants and tips in real time"}
        </p>
        <button onClick={()=>setPage("travel")} style={{background:"var(--red)",color:"#fff",border:"none",borderRadius:980,padding:"14px 32px",fontSize:15,fontWeight:700}}>
          {TT[lang]?.btn||"Generate City Guide"} →
        </button>
      </div>}
    </div>
  </div>;
}

export default function App(){
  const[lang,setLang]=useState("zh");const[region,setRegion]=useState("all");
  const[page,setPage]=useState("home");const[detail,setDetail]=useState(null);
  const[user,setUser]=useState(null);const[showAuth,setShowAuth]=useState(false);
  const[catFilter,setCatFilter]=useState(null);

  useEffect(()=>{
    onAuthChange(session=>{
      if(session?.user) setUser(session.user.email);
      else setUser(null);
    });
  },[]);

  useEffect(()=>{window.scrollTo(0,0);},[page]);

  const handleLogout=async()=>{await authSignOut();setUser(null);setPage("home");};

  const isRTL=lang==="ar";
  return <div dir={isRTL?"rtl":"ltr"} style={{textAlign:isRTL?"right":"left"}}>
    <style>{GS}</style>
    <Nav lang={lang} setLang={setLang} region={region} setRegion={setRegion} user={user} setPage={setPage} setCatFilter={setCatFilter} onAuth={()=>setShowAuth(true)}/>
    {showAuth&&<AuthModal t={T[lang]} onClose={()=>setShowAuth(false)} onLogin={email=>{setUser(email);setShowAuth(false);setPage("member");}}/>}
    {page==="home"            &&<Home   lang={lang} region={region} setPage={setPage} setDetail={setDetail} initCatI={catFilter}/>}
    {page==="detail"&&detail  &&<Detail m={detail} lang={lang} setPage={setPage}/>}
    {page==="pub"             &&<Publish lang={lang} setPage={setPage} user={user?{email:user}:null}/>}
    {page==="member"&&user    &&<Member lang={lang} user={user} setPage={setPage} onLogout={handleLogout}/>}
    {page==="admin"           &&<Admin  lang={lang} setPage={setPage}/>}
    {page==="travel"          &&<Travel lang={lang} setPage={setPage}/>}
    {page==="featured-dining" &&<Featured lang={lang} setPage={setPage} initTab="dining"/>}
    {page==="featured-hotels" &&<Featured lang={lang} setPage={setPage} initTab="hotels"/>}
  </div>;
}
