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
    <header className="glass border-b border-border/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="Visionarius Logo" className="w-10 h-10 rounded-xl shadow-apple" />
              <div>
                <h1 className="text-title font-semibold text-foreground tracking-tight">Visionarius Agency</h1>
                <p className="text-caption text-muted-foreground">Sales Performance Analytics</p>
              </div>
            </div>
          </div>

          <nav className="flex space-x-2">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                className={`apple-button flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-body font-medium ${
                  location === "/" 
                    ? "bg-primary text-primary-foreground shadow-apple" 
                    : "hover:bg-card/50"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link href="/data-entry">
              <Button
                variant={location === "/data-entry" ? "default" : "ghost"}
                className={`apple-button flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-body font-medium ${
                  location === "/data-entry" 
                    ? "bg-primary text-primary-foreground shadow-apple" 
                    : "hover:bg-card/50"
                }`}
              >
                <Table className="h-4 w-4" />
                <span>Sales Opportunities</span>
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant={location === "/calendar" ? "default" : "ghost"}
                className={`apple-button flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-body font-medium ${
                  location === "/calendar" 
                    ? "bg-primary text-primary-foreground shadow-apple" 
                    : "hover:bg-card/50"
                }`}
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
