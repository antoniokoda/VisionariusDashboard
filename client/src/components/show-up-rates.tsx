import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type ShowUpRates } from "@shared/schema";

interface ShowUpRatesProps {
  showUpRates: ShowUpRates;
}

export function ShowUpRatesComponent({ showUpRates }: ShowUpRatesProps) {
  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-gray-900">Show-Up Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Discovery Call Show-Up Rates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
              Discovery Calls
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">First Discovery</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.firstDiscovery}%</span>
                </div>
                <Progress value={showUpRates.firstDiscovery} className="h-2 [&>div]:bg-gray-900" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">Second Discovery</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.secondDiscovery}%</span>
                </div>
                <Progress value={showUpRates.secondDiscovery} className="h-2 [&>div]:bg-gray-900" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">Third Discovery</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.thirdDiscovery}%</span>
                </div>
                <Progress value={showUpRates.thirdDiscovery} className="h-2 [&>div]:bg-gray-900" />
              </div>
            </div>
          </div>

          {/* Closing Call Show-Up Rates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
              Closing Calls
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">First Closing</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.firstClosing}%</span>
                </div>
                <Progress value={showUpRates.firstClosing} className="h-2 [&>div]:bg-gray-900" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">Second Closing</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.secondClosing}%</span>
                </div>
                <Progress value={showUpRates.secondClosing} className="h-2 [&>div]:bg-gray-900" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-700">Third Closing</span>
                  <span className="text-sm font-medium text-gray-900">{showUpRates.thirdClosing}%</span>
                </div>
                <Progress value={showUpRates.thirdClosing} className="h-2 [&>div]:bg-gray-900" />
              </div>
            </div>
          </div>

          {/* Overall Performance Donut Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-4">
              Overall Show-Up Rate
            </h3>
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 border-t-primary animate-none relative">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary"
                  style={{
                    transform: `rotate(${(showUpRates.overall / 100) * 360}deg)`,
                    clipPath: `inset(0 ${100 - showUpRates.overall}% 0 0)`
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-900">{showUpRates.overall}%</div>
                  <div className="text-xs text-neutral-500">Average</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
