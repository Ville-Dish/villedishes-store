import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const RecentOrders = ({ data }: orderDashboardProps) => {
  return (
    <div className="space-y-8 justify-center items-center">
      {data.length === 0 ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-sm text-muted-foreground">No recent orders found</p>
        </div>
      ) : (
        data.map((sale, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {sale.customer
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.order}</p>
              <p className="text-sm text-muted-foreground">{sale.customer}</p>
            </div>
            <div className="ml-auto font-medium">
              CAD$ {sale.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
