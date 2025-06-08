import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Phone, ExternalLink, User, Clock } from "lucide-react";
import { type CalendarEvent, type Client } from "@shared/schema";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { data: allEvents, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
  });

  // Filter events for the current month
  const events = allEvents?.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  }) || [];

  // Get clients data for current month statistics
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const { data: monthlyClients } = useQuery<Client[]>({
    queryKey: [`/api/clients/month/${currentYear}/${currentMonth}`],
  });

  // Ensure monthlyClients is always an array for safe operations
  const safeMonthlyClients = monthlyClients || [];

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string): string => {
    if (type.includes("discovery")) return "bg-blue-500";
    if (type.includes("closing")) return "bg-green-500";
    return "bg-gray-500";
  };

  const getEventTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      "discovery1": "Discovery 1",
      "discovery2": "Discovery 2", 
      "discovery3": "Discovery 3",
      "closing1": "Closing 1",
      "closing2": "Closing 2",
      "closing3": "Closing 3"
    };
    return typeMap[type] || type;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the grid
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    if (!events) return [];
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return events.filter(event => {
      const eventDate = event.date.split('T')[0]; // Get just the date part
      return eventDate === dateString;
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Call Calendar</h1>
          <p className="text-neutral-600">View all past, present and future calls</p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-neutral-900 min-w-[200px] text-center">
            {formatDate(currentDate)}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-neutral-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonthDay = isCurrentMonth(day);
                  const isTodayDay = isToday(day);

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border border-gray-100 
                        ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                        ${isTodayDay ? 'bg-blue-50 border-blue-200' : ''}
                        hover:bg-gray-50 transition-colors
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentMonthDay ? 'text-neutral-900' : 'text-neutral-400'}
                        ${isTodayDay ? 'text-blue-600' : ''}
                      `}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`
                              text-xs p-1 rounded cursor-pointer
                              ${getEventTypeColor(event.type)} text-white
                              hover:opacity-80 transition-opacity
                            `}
                          >
                            <div className="truncate font-medium">
                              {event.clientName}
                            </div>
                            <div className="truncate opacity-90">
                              {getEventTypeLabel(event.type)}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-neutral-500 text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900">
                      {selectedEvent.clientName}
                    </h3>
                    <Badge className={`${getEventTypeColor(selectedEvent.type)} text-white mt-2`}>
                      {getEventTypeLabel(selectedEvent.type)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-600">
                        Date: {new Date(selectedEvent.date).toLocaleDateString('en-US')}
                      </span>
                    </div>

                    {selectedEvent.duration && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          Duration: {selectedEvent.duration} minutes
                        </span>
                      </div>
                    )}

                    {selectedEvent.recording && (
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-neutral-500" />
                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm"
                          onClick={() => window.open(selectedEvent.recording!, '_blank')}
                        >
                          View Recording
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Store client ID for highlighting and navigate to data entry
                        sessionStorage.setItem('highlightClientId', selectedEvent.clientId.toString());
                        window.location.href = '/data-entry';
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Client Data
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an event from the calendar to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estadísticas Rápidas - {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Total de Eventos:</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Llamadas de Descubrimiento:</span>
                  <span className="font-semibold text-blue-600">
                    {events.filter(e => e.type.includes('discovery')).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Llamadas de Cierre:</span>
                  <span className="font-semibold text-green-600">
                    {events.filter(e => e.type.includes('closing')).length}
                  </span>
                </div>
                
                {safeMonthlyClients.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Oportunidades Totales:</span>
                      <span className="font-semibold">{safeMonthlyClients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Deals Ganados:</span>
                      <span className="font-semibold text-green-600">
                        {safeMonthlyClients.filter((c: Client) => c.dealStatus === "Won").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Deals Perdidos:</span>
                      <span className="font-semibold text-red-600">
                        {safeMonthlyClients.filter((c: Client) => c.dealStatus === "Lost").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Revenue Total:</span>
                      <span className="font-semibold text-emerald-600">
                        ${safeMonthlyClients
                          .filter((c: Client) => c.dealStatus === "Won")
                          .reduce((sum: number, c: Client) => sum + parseFloat(c.revenue || "0"), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Cash Collected:</span>
                      <span className="font-semibold text-green-600">
                        ${safeMonthlyClients
                          .reduce((sum: number, c: Client) => sum + parseFloat(c.cashCollected || "0"), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Tasa de Cierre:</span>
                      <span className="font-semibold text-blue-600">
                        {safeMonthlyClients.length > 0 
                          ? Math.round((safeMonthlyClients.filter((c: Client) => c.dealStatus === "Won").length / safeMonthlyClients.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}