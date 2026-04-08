import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p className="text-muted-foreground">
                Pro Pointers Plus ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our coaching 
                management platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
              <p className="text-muted-foreground">We collect several types of information:</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Name and email address</li>
                <li>Phone number (if provided)</li>
                <li>Account credentials</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Client Data</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Client contact information</li>
                <li>Session schedules and notes</li>
                <li>Payment records</li>
                <li>Progress notes and videos</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Usage Information</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Log data and analytics</li>
                <li>Device information</li>
                <li>Browser type and version</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Provide and maintain the Service</li>
                <li>Manage your account and authenticate users</li>
                <li>Process payments and maintain financial records</li>
                <li>Send administrative information and updates</li>
                <li>Improve and personalize your experience</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your information. Your data is stored securely 
                using encryption and access controls. However, no method of transmission over the internet is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in operating our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Your Data Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your experience and analyze usage. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our Service may contain links to third-party websites or services. We are not responsible for 
                the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as necessary to provide the Service and comply with legal 
                obligations. You may request deletion of your account and data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or our data practices, please contact us through 
                the Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
