import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const Terms = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-2 tracking-[-0.02em]">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            {[
              { title: "1. Acceptance of Terms", content: "By accessing and using Pro Pointers Plus (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the Service." },
              { title: "2. Use of Service", content: "Pro Pointers Plus provides a platform for coaches to manage their clients, sessions, and business operations. You agree to use the Service only for lawful purposes and in accordance with these Terms." },
              { title: "3. User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account." },
              { title: "4. Data and Privacy", content: "Your use of the Service is also governed by our Privacy Policy. We collect and use information in accordance with our Privacy Policy to provide and improve the Service." },
              { title: "5. Content Ownership", content: "You retain all rights to the content you upload to the Service, including client data, notes, and videos. By uploading content, you grant us a license to store, process, and display this content as necessary to provide the Service." },
              { title: "7. Service Modifications", content: "We reserve the right to modify or discontinue the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service." },
              { title: "8. Limitation of Liability", content: "To the maximum extent permitted by law, Pro Pointers Plus shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service." },
              { title: "9. Termination", content: "We may terminate or suspend your account and access to the Service immediately, without prior notice, if you breach these Terms or for any other reason at our sole discretion." },
              { title: "10. Changes to Terms", content: "We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the \"Last updated\" date." },
              { title: "11. Contact", content: "If you have any questions about these Terms, please contact us through the Service." },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold font-heading text-foreground mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-semibold font-heading text-foreground mb-2">6. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-2">You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Violating laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting harmful code or malware</li>
                <li>Attempting to gain unauthorized access to the Service</li>
                <li>Using the Service for any fraudulent purpose</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
