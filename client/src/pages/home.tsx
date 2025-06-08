import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Calendar, Database, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {(user as any)?.firstName || (user as any)?.email || 'User'}
            </h1>
            <p className="text-gray-600">Visionarius Agency Sales Management</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/api/logout'}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  View KPIs and performance analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/data-entry">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Data Entry</CardTitle>
                <CardDescription>
                  Manage sales opportunities and clients
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Monthly view of activities and deals
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/overview">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Comprehensive sales performance overview
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}