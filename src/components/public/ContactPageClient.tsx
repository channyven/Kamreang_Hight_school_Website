"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactInput } from "@/schemas/validations";
import { submitContactMessage } from "@/actions/contact";

interface ContactPageClientProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export default function ContactPageClient({ address, phone, email, hours }: ContactPageClientProps) {
  const t = useTranslations("contact");
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    const result = await submitContactMessage(data);
    if (result.success) {
      toast.success(t("success"));
      reset();
    } else {
      toast.error(result.error ?? t("error"));
    }
  };

  const contactInfo = [
    { icon: <MapPin className="w-5 h-5 text-school-gold-500" />, label: t("address"), value: address },
    { icon: <Phone className="w-5 h-5 text-school-gold-500" />, label: t("phone"), value: phone },
    { icon: <Mail className="w-5 h-5 text-school-gold-500" />, label: t("email"), value: email },
    { icon: <Clock className="w-5 h-5 text-school-gold-500" />, label: t("working_hours"), value: hours },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("title")}
          </h1>
          <p className={`text-school-blue-100 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km" ? "ព័ត៌មានទំនាក់ទំនង" : "Contact Information"}
            </h2>

            <div className="space-y-5 mb-8">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-school-blue-50 flex items-center justify-center shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{info.label}</p>
                    <p className={`font-medium text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-72 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15631.744782126357!2d102.483699!3d13.0855486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3104c85879b7f16b%3A0x2ae9cc3a5ce0878a!2sKamrieng%20High%20School!5e1!3m2!1sen!2skh!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={locale === "km" ? "ផែនទីវិទ្យាល័យកំរៀង" : "Kamrieng High School Map"}
                className="w-full h-full"
              />
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km" ? "ផ្ញើសារ" : "Send Message"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input id="name" {...register("name")} placeholder={locale === "km" ? "ឈ្មោះ" : "John Doe"} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input id="phone" {...register("phone")} placeholder="+855 12 000 000" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")} *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">{t("subject")} *</Label>
                <Input id="subject" {...register("subject")} placeholder={locale === "km" ? "ប្រធានបទ" : "Subject"} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">{t("message")} *</Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder={locale === "km" ? "សាររបស់អ្នក..." : "Your message..."}
                  className="min-h-[120px]"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-school-blue-800 hover:bg-school-blue-900"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? t("sending") : t("send")}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
