import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Sparkles } from "lucide-react";

const Earn = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardDescription className="text-base">
                Earn money through virtual instruction
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>
              We're working on an exciting new feature that will allow you to monetize your expertise through virtual coaching sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Earn;
