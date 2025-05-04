
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { apiService } from '@/services/api';
import { 
  BarChart, 
  Bar as RechartsBar, 
  LineChart, 
  Line as RechartsLine, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartViewerProps {
  chartType?: string;
  chartData: any;
  onChartGenerated?: (data: any) => void;
}

const ChartViewer: React.FC<ChartViewerProps> = ({ 
  chartType = 'bar', 
  chartData,
  onChartGenerated 
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleRegenerateChart = async () => {
    if (!prompt) {
      toast.warning('Please enter a prompt for chart regeneration');
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await apiService.generateChart(prompt);
      
      if (response.chartData) {
        toast.success('Chart regenerated successfully');
        if (onChartGenerated) {
          onChartGenerated(response.chartData);
        }
      }
    } catch (error) {
      toast.error('Failed to regenerate chart', {
        description: 'Please try again with a different prompt.'
      });
      console.error('Chart regeneration error:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  // If we have a URL instead of direct data
  if (typeof chartData === 'string') {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-medium">Chart Visualization</h3>
        </div>
        <div className="p-4">
          <img 
            src={chartData} 
            alt="Chart visualization" 
            className="w-full h-auto rounded" 
          />
        </div>
      </div>
    );
  }

  // For direct chart data
  const renderChart = () => {
    if (!chartData || !chartData.data) {
      return <div className="p-8 text-center text-muted-foreground">No chart data available</div>;
    }

    // Convert Chart.js format to Recharts format
    const chartJsToRecharts = (chartJsData: any) => {
      if (!chartJsData || !chartJsData.labels || !chartJsData.datasets) {
        return [];
      }

      return chartJsData.labels.map((label: string, index: number) => {
        const dataPoint: Record<string, any> = { name: label };
        
        chartJsData.datasets.forEach((dataset: any, datasetIndex: number) => {
          const datasetLabel = dataset.label || `Dataset ${datasetIndex}`;
          dataPoint[datasetLabel] = dataset.data[index];
        });
        
        return dataPoint;
      });
    };

    const rechartsData = chartJsToRecharts(chartData.data);
    const datasets = chartData.data.datasets || [];
    const type = chartData.type || chartType;

    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {(type === 'bar') ? (
            <BarChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {datasets.map((dataset: any, index: number) => (
                <RechartsBar
                  key={index}
                  dataKey={dataset.label || `Dataset ${index}`}
                  fill={dataset.backgroundColor || `rgba(126, 105, 171, ${0.6 - (index * 0.1)})`}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {datasets.map((dataset: any, index: number) => (
                <RechartsLine
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Dataset ${index}`}
                  stroke={dataset.borderColor || dataset.backgroundColor || `rgba(126, 105, 171, ${1 - (index * 0.1)})`}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden mb-4">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-medium">Chart Visualization</h3>
      </div>
      <div className="p-4">
        {renderChart()}
        
        <div className="mt-4">
          <div className="flex space-x-2 items-center">
            <Input
              placeholder="Describe the chart you want to see..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRegenerating}
              className="flex-1"
            />
            <Button 
              onClick={handleRegenerateChart} 
              disabled={isRegenerating || !prompt}
            >
              {isRegenerating ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartViewer;
