"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DailyActivity {
  count: number;
  avgScore: number;
  totalScore: number;
}

interface ActivityHeatmapProps {
  dailyActivityMap: Record<string, DailyActivity>;
}

export function ActivityHeatmap({ dailyActivityMap }: ActivityHeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { weeks, months, yearStats } = useMemo(() => {
    // Start from Jan 1 of selected year
    const startDate = new Date(selectedYear, 0, 1);
    // Adjust to Sunday of that week
    const startDay = startDate.getDay();
    if (startDay !== 0) {
      startDate.setDate(startDate.getDate() - startDay);
    }

    // End at Dec 31 of selected year
    const endDate = new Date(selectedYear, 11, 31);
    const today = new Date();

    const weeks: { date: Date; activity: DailyActivity | null; inYear: boolean }[][] = [];
    let currentDate = new Date(startDate);
    let currentWeek: { date: Date; activity: DailyActivity | null; inYear: boolean }[] = [];

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const activity = currentDate <= today ? (dailyActivityMap[dateKey] || null) : null;
      const inYear = currentDate.getFullYear() === selectedYear;

      currentWeek.push({
        date: new Date(currentDate),
        activity,
        inYear
      });

      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
        if (currentDate >= endDate) break;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Month labels for selected year
    const months: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const dayInYear = week.find(d => d.inYear);
      if (dayInYear) {
        const month = dayInYear.date.getMonth();
        if (month !== lastMonth) {
          months.push({
            name: dayInYear.date.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex
          });
          lastMonth = month;
        }
      }
    });

    // Calculate year stats
    let activeDays = 0;
    let totalQuizzes = 0;
    Object.entries(dailyActivityMap).forEach(([dateStr, data]) => {
      if (dateStr.startsWith(String(selectedYear))) {
        activeDays++;
        totalQuizzes += data.count;
      }
    });

    return { weeks, months, yearStats: { activeDays, totalQuizzes } };
  }, [dailyActivityMap, selectedYear]);

  const getColorClass = (activity: DailyActivity | null, inYear: boolean) => {
    if (!inYear) return "bg-transparent";
    if (!activity) return "bg-muted/40";
    const score = activity.avgScore;
    if (score >= 90) return "bg-primary";
    if (score >= 75) return "bg-primary/80";
    if (score >= 60) return "bg-primary/60";
    if (score >= 40) return "bg-primary/40";
    return "bg-primary/25";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const squareSize = "w-[10px] h-[10px] sm:w-3 sm:h-3";
  const gapSize = "gap-[2px] sm:gap-1";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {yearStats.activeDays} active days • {yearStats.totalQuizzes} quizzes in {selectedYear}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(y => y - 1)}
              disabled={selectedYear <= 2025}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(y => y + 1)}
              disabled={selectedYear >= currentYear + 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="flex justify-center overflow-x-auto">
            <div className="inline-block">
              {/* Month labels */}
              <div className="flex text-[9px] sm:text-xs text-muted-foreground mb-1 ml-5 sm:ml-6">
                {months.map((month, i) => {
                  const nextMonth = months[i + 1];
                  const widthWeeks = nextMonth
                    ? nextMonth.weekIndex - month.weekIndex
                    : weeks.length - month.weekIndex;
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0"
                      style={{ width: `${widthWeeks * 12}px` }}
                    >
                      {widthWeeks >= 3 ? month.name : ''}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start">
                {/* Day labels */}
                <div className={`flex flex-col ${gapSize} text-[9px] sm:text-xs text-muted-foreground flex-shrink-0 w-4 sm:w-5 pr-0.5`}>
                  <div className={squareSize}></div>
                  <div className={`${squareSize} flex items-center`}>M</div>
                  <div className={squareSize}></div>
                  <div className={`${squareSize} flex items-center`}>W</div>
                  <div className={squareSize}></div>
                  <div className={`${squareSize} flex items-center`}>F</div>
                  <div className={squareSize}></div>
                </div>

                {/* Heatmap grid */}
                <div className={`flex ${gapSize}`}>
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className={`flex flex-col ${gapSize}`}>
                      {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                        const day = week.find((d) => d.date.getDay() === dayOfWeek);
                        if (!day) {
                          return <div key={dayOfWeek} className={squareSize} />;
                        }
                        if (!day.inYear) {
                          return <div key={dayOfWeek} className={squareSize} />;
                        }
                        return (
                          <Tooltip key={dayOfWeek}>
                            <TooltipTrigger asChild>
                              <div
                                className={`${squareSize} rounded-sm ${getColorClass(day.activity, day.inYear)} transition-colors hover:ring-1 hover:ring-foreground/40 cursor-default`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-medium">{formatDate(day.date)}</div>
                              {day.activity ? (
                                <div className="text-muted-foreground">
                                  {day.activity.count} {day.activity.count === 1 ? 'quiz' : 'quizzes'} • {day.activity.avgScore.toFixed(0)}% avg
                                </div>
                              ) : (
                                <div className="text-muted-foreground">No activity</div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 text-[9px] sm:text-xs text-muted-foreground">
                <span>Less</span>
                <div className={`${squareSize} rounded-sm bg-muted/40`} />
                <div className={`${squareSize} rounded-sm bg-primary/25`} />
                <div className={`${squareSize} rounded-sm bg-primary/40`} />
                <div className={`${squareSize} rounded-sm bg-primary/60`} />
                <div className={`${squareSize} rounded-sm bg-primary/80`} />
                <div className={`${squareSize} rounded-sm bg-primary`} />
                <span>More</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
