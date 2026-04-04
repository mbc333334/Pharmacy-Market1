import Colors from "@/constants/colors";
import SharedDeliveryScreen from "@/components/SharedDeliveryScreen";

export default function PharmacyDeliveryScreen() {
  return (
    <SharedDeliveryScreen
      accentColor={Colors.primary}
      reviewerType="pharmacy"
      bannerText="فعّل الشركات التي تريد العمل معها، وقيّمها بعد كل تجربة توصيل لمساعدة باقي الصيادلة"
      bannerBgColor="#EFF6FF"
      addModalTitle="إضافة شركة توصيل مخصصة"
      feeLabelText="رسوم التوصيل الأساسية (د.ع)"
      defaultFee={3000}
      defaultTime="2-4 ساعات"
      defaultLogo="🚚"
      defaultCompanyType="local"
      defaultFeatures={["توصيل محلي"]}
      whatsappMessage={(name) => `مرحباً ${name}، أنا من الصيدلية، أريد الاستفسار عن خدمات التوصيل.`}
    />
  );
}
