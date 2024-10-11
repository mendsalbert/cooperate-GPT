import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsContent() {
  const settings = {
    defaultLicense: "CC BY",
    notificationsEnabled: true,
    aiUsageAlerts: true,
    earningsThreshold: 100,
    defaultCurrency: "USD",
  };

  return (
    <Card className="mt-6">
      <CardHeader className="">
        <CardTitle>Settings (Frozen)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Default License</Label>
            <p className="mt-1">{settings.defaultLicense}</p>
          </div>

          <div>
            <Label>Notifications</Label>
            <p className="mt-1">
              {settings.notificationsEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          <div>
            <Label>AI Usage Alerts</Label>
            <p className="mt-1">
              {settings.aiUsageAlerts ? "Enabled" : "Disabled"}
            </p>
          </div>

          <div>
            <Label>Earnings Alert Threshold</Label>
            <p className="mt-1">{settings.earningsThreshold}</p>
          </div>

          <div>
            <Label>Default Currency</Label>
            <p className="mt-1">{settings.defaultCurrency}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
