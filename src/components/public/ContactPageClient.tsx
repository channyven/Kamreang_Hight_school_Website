"use client";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Clock, Send, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactInput } from "@/schemas/validations";
import { submitContactMessage } from "@/actions/contact";
import { convertGoogleDriveUrl } from "@/utils";

interface ContactPageClientProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
  campusPhoto?: string;
  facebook?: string;
  tiktok?: string;
}
export default function ContactPageClient({
  address,
  phone,
  email,
  hours,
  campusPhoto,
  facebook,
  tiktok,
}: ContactPageClientProps) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema)
  });
  const onSubmit = async (data: ContactInput) => {
    try {
      const result = await submitContactMessage(data);
      if (result.success) {
        toast.success(t("success"));
        reset();
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const contactInfo = [

    {
      icon: <MapPin className="w-5 h-5 text-school-gold-500" />,
      label: t("address"),
      value: address
    },
    {
      icon: <Phone className="w-5 h-5 text-school-gold-500" />,
      label: t("phone"),
      value: phone
    },
    {
      icon: <Mail className="w-5 h-5 text-school-gold-500" />,
      label: t("email"),
      value: email
    },

    {
      icon: <Clock className="w-5 h-5 text-school-gold-500" />,
      label: t("working_hours"),
      value: hours
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1
            className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""
              }`}
          >
            {t("title")}

          </h1>
          <p
            className={`text-school-blue-100 ${locale === "km" ? "font-khmer" : ""
              }`}
          >
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 space-y-10 max-w-6xl mx-auto">
        {/* Row 1: Contact Information full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-2xl font-bold text-gray-900 text-center mb-8 ${locale === "km" ? "font-khmer" : ""}`}>
            {locale === "km" ? "ព័ត៌មានទំនាក់ទំនង" : "Contact Information"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-school-blue-50 flex items-center justify-center shrink-0">
                    {info.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {info.label}
                  </p>
                </div>
                <p className={`font-semibold text-gray-900 leading-snug ${locale === "km" ? "font-khmer" : ""}`}>
                  {info.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Row 2: Campus Photo + Social Media + Send Message side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            {campusPhoto && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative h-[520px] w-full"
              >
                <img
                  src={convertGoogleDriveUrl(campusPhoto)}
                  alt={locale === "km" ? "រូបថតបរិវេណសាលា" : "Campus Photo"}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </motion.div>
            )}

            {/* Social Media directly under photo */}
            {(facebook || tiktok) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                  {locale === "km" ? "តាមដានយើង" : "Follow Us"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-[#1877F2] hover:border-[#1877F2] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Facebook className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors truncate">
                        Facebook
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-white/70 transition-colors truncate">
                        {locale === "km" ? "ទំព័រហ្វេសប៊ុក" : "Follow on Facebook"}
                      </p>
                    </div>
                  </a>
                )}
                {tiktok && (
                  <a
                    href={tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-black hover:border-black hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors truncate">
                        TikTok
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-white/70 transition-colors truncate">
                        {locale === "km" ? "ទំព័រធីកតុក" : "Follow on TikTok"}
                      </p>
                    </div>
                  </a>
                )}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10"
          >
            <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km" ? "ផ្ញើសារ" : "Send Message"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">{t("name")} *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={locale === "km" ? "ឈ្មោះ" : "John Doe"}
                    className="h-12 text-base"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">{t("phone")}</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+855 12 000 000"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">{t("email")} *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@example.com" className="h-12 text-base" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-medium">{t("subject")} *</Label>
                <Input id="subject" {...register("subject")} placeholder="Subject" className="h-12 text-base" />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-medium">{t("message")} *</Label>
                <Textarea id="message" {...register("message")} placeholder="Your message..." className="min-h-[140px] text-base" />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900 h-12 text-base font-semibold" disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                {isSubmitting ? t("sending") : t("send")}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Row 3: Google Map full width */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 h-[450px] shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15631.744782126357!2d102.483699!3d13.0855486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3104c85879b7f16b%3A0x2ae9cc3a5ce0878a!2sKamrieng%20High%20School!5e1!3m2!1sen!2skh!4v1"
            width="100%" height="100%" style={{ border: 0 }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={locale === "km" ? "ផែនទីវិទ្យាល័យកំរៀង" : "Kamrieng High School Map"}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}