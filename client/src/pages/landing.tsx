import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Visionarius Agency Sales Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your sales performance, manage opportunities, and grow your business
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In to Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Dashboard Analytics</CardTitle>
              <CardDescription>
                Real-time KPIs and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Track opportunities through the entire sales funnel
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Revenue Tracking</CardTitle>
              <CardDescription>
                Monitor revenue and cash collection in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Visualize your sales activities by month
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-500">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}