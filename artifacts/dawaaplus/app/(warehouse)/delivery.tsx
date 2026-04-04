import SharedDeliveryScreen from "@/components/SharedDeliveryScreen";

const WH_COLOR = "#0D7A54";

export default function WarehouseDeliveryScreen() {
  return (
    <SharedDeliveryScreen
      accentColor={WH_COLOR}
      reviewerType="warehouse"
      bannerText="حدد شركات التوصيل المناسبة لشحن الأدوية بالجملة، وقيّمها بعد كل تجربة شحن"
      bannerBgColor="#E8F4F0"
      addModalTitle="إضافة شركة توصيل للمذخر"
      feeLabelText="رسوم الشحن الأساسية (د.ع)"
      defaultFee={10000}
      defaultTime="يوم عمل"
      defaultLogo="🚛"
      defaultCompanyType="national"
      defaultFeatures={["توصيل بالجملة", "التعامل مع الصيدليات"]}
      whatsappMessage={(name) => `مرحباً ${name}، أنا من المذخر، أريد الاستفسار عن خدمات توصيل الطلبات بالجملة.`}
    />
  );
}
