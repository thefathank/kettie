import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Pro Pointers Plus ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
              <p className="text-muted-foreground">
                Pro Pointers Plus provides a platform for coaches to manage their clients, sessions, and business operations. 
                You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data and Privacy</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our Privacy Policy. We collect and use information in accordance 
                with our Privacy Policy to provide and improve the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Content Ownership</h2>
              <p className="text-muted-foreground">
                You retain all rights to the content you upload to the Service, including client data, notes, and videos. 
                By uploading content, you grant us a license to store, process, and display this content as necessary to 
                provide the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Prohibited Activities</h2>
              <p className="text-muted-foreground">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Violating laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting harmful code or malware</li>
                <li>Attempting to gain unauthorized access to the Service</li>
                <li>Using the Service for any fraudulent purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Service Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue the Service at any time, with or without notice. 
                We shall not be liable to you or any third party for any modification, suspension, or discontinuation 
                of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Pro Pointers Plus shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use of or inability 
                to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                if you breach these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                by posting the new Terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us through the Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
