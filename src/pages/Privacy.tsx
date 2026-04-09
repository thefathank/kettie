import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto glass rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-2 tracking-[-0.02em]">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold font-heading text-foreground mb-2">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pro Pointers Plus ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our coaching management platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-heading text-foreground mb-2">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">We collect several types of information:</p>

              <h3 className="text-lg font-semibold font-heading text-foreground mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Name and email address</li>
                <li>Phone number (if provided)</li>
                <li>Account credentials</li>
              </ul>

              <h3 className="text-lg font-semibold font-heading text-foreground mt-4 mb-2">Client Data</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Client contact information</li>
                <li>Session schedules and notes</li>
                <li>Payment records</li>
                <li>Progress notes and videos</li>
              </ul>

              <h3 className="text-lg font-semibold font-heading text-foreground mt-4 mb-2">Usage Information</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Log data and analytics</li>
                <li>Device information</li>
                <li>Browser type and version</li>
              </ul>
            </section>

            {[
              { title: "3. How We Use Your Information", content: "We use the collected information to:", list: ["Provide and maintain the Service", "Manage your account and authenticate users", "Process payments and maintain financial records", "Send administrative information and updates", "Improve and personalize your experience", "Monitor and analyze usage patterns", "Detect and prevent fraud or abuse"] },
              { title: "4. Data Storage and Security", content: "We implement industry-standard security measures to protect your information. Your data is stored securely using encryption and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security." },
              { title: "5. Data Sharing and Disclosure", content: "We do not sell your personal information. We may share your information only in the following circumstances:", list: ["With your explicit consent", "To comply with legal obligations", "To protect our rights and safety", "With service providers who assist in operating our Service"] },
              { title: "6. Your Data Rights", content: "You have the right to:", list: ["Access your personal information", "Correct inaccurate data", "Request deletion of your data", "Export your data", "Opt-out of marketing communications"] },
              { title: "7. Cookies and Tracking", content: "We use cookies and similar tracking technologies to enhance your experience and analyze usage. You can control cookie settings through your browser preferences." },
              { title: "8. Children's Privacy", content: "Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13." },
              { title: "9. Third-Party Services", content: "Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies." },
              { title: "10. Data Retention", content: "We retain your information for as long as necessary to provide the Service and comply with legal obligations. You may request deletion of your account and data at any time." },
              { title: "11. Changes to Privacy Policy", content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date." },
              { title: "12. Contact Us", content: "If you have questions about this Privacy Policy or our data practices, please contact us through the Service." },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold font-heading text-foreground mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                {section.list && (
                  <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
