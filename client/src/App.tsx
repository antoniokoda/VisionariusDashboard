import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BarChart3, Table, Calendar as CalendarIcon } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import DataEntry from "@/pages/data-entry";
import Calendar from "@/pages/calendar";
import NotFound from "@/pages/not-found";
import logoPath from "@assets/Untitled design (1)_1749318828090.png";

function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={logoPath} alt="Visionarius Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-neutral-900">Visionarius Agency</h1>
            </div>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-600 font-medium">Sales Performance</span>
          </div>

          <nav className="flex space-x-4">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link href="/data-entry">
              <Button
                variant={location === "/data-entry" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Table className="h-4 w-4" />
                <span>Data Entry</span>
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant={location === "/calendar" ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/data-entry" component={DataEntry} />
          <Route path="/calendar" component={Calendar} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
