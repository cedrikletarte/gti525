import Box from '@mui/material/Box';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LineHighlightPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';

import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';


export default function Chart({ data = [] }) {
    return (
        <Box sx={{ width: '100%', height: 400 }}>
            <ChartsContainer
                series={[
                    {
                        type: 'line',
                        yAxisId: 'passage',
                        color: 'green',
                        label: 'Nombre de passages',
                        data: data.map((passage) => passage.total_passages),
                    },
                ]}
                xAxis={[
                    {
                        id: 'date',
                        data:data.map((passage) => passage.jour),
                        scaleType: 'band',
                        height: 48,
                    },
                ]}
                yAxis={[
                    {
                        id: 'passage',
                        scaleType: 'linear',
                        position: 'left',
                        width: 55,
                    },
                ]}
            >
                <ChartsAxisHighlight x="line" />
                <BarPlot />
                <LinePlot />
                <LineHighlightPlot />
                <ChartsXAxis
                    label="Date"
                    axisId="date"
                    tickInterval={(value, index) => {
                        return index % 30 === 0;
                    }}
                    tickLabelStyle={{
                        fontSize: 10,
                    }}
                />
                <ChartsYAxis
                    label="Nombre de passages"
                    axisId="passage"
                    tickLabelStyle={{ fontSize: 10 }}
                />
                <ChartsTooltip />
            </ChartsContainer>
        </Box>
    );
}