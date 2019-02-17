const React = require("react");
const moment = require("moment");

const {
    ComposedChart,
    XAxis,
    YAxis,
    Area,
    CartesianGrid,
    ReferenceLine,
    Line
} = require("recharts");

const getDomain = (...arrays) => {
    const min = Math.min(...arrays.map(arr => Math.min(...arr)));
    const max = Math.max(...arrays.map(arr => Math.max(...arr)));
    return [min, max];
    
}

class Cover extends React.Component {
    render() {
        const {
            config,
            weather,
            temperatureHistory,
            temperatureHistoryToday,
            temperatureHistoryYesterday,
            battery,
            temperature,
            timestamp,
            chartRange,
            now
        } = this.props;

        moment.tz.setDefault(config.timezone);
        moment.locale(config.language);
        const time = moment(timestamp).format("L LT");

        const ticks = [chartRange[0].toDate()];
        let tickDate = moment(chartRange[0]);

        while (tickDate < chartRange[1]) {
            tickDate = tickDate.add(4, "hours");
            ticks.push(tickDate.toDate());
        }
        ticks.pop();
        ticks.shift();

        let [minTemperature, maxTemperature] = getDomain([...weather.map(x => x.value)], [...temperatureHistory.map(x => x.value)]);
        minTemperature = Math.min(0, minTemperature);

        let temperatureTicks = [minTemperature - (minTemperature % 5)];
        while (temperatureTicks[temperatureTicks.length - 1] < maxTemperature) {
            temperatureTicks.push(temperatureTicks[temperatureTicks.length - 1] + 5);
        }
        temperatureTicks = temperatureTicks.filter(x => x !== 0);

        const formatXaxisTick = (time) => {
            const diff = moment(time).diff(now, "hours");
            if(diff === 0) {
                return "";
            }
            let result = "";
            if(diff > 0) {
                result = "+";
            }
            result += `${diff}h`;
            return result;
        }

        return (
            <html>
                <head>
                    <link rel="stylesheet" href="/css/style.css" />
                </head>

                <body>
                    <div className="temperature">
                        <span>{temperature.state}</span>
                        <span className="unit">{temperature.attributes.unit_of_measurement}</span>
                    </div>
                    <div className="time">{time}</div>
                    <ComposedChart
                        className="chart"
                        width={600}
                        height={350}
                        margin={{ top: 10, left: 0, right: 0, bottom: 0 }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />
                        <Area
                            type="monotone"
                            dataKey="value"
                            data={[...temperatureHistoryYesterday].map(x => {
                                x.value = [minTemperature, x.value];
                                return x;
                            })}
                            domain={[-500, "auto"]}
                            fill="rgba(128,128,128,0.3)"
                            stroke={null}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            data={[...temperatureHistoryToday].map(x => {
                                x.value = [minTemperature, x.value];
                                return x;
                            })}
                            domain={[-500, "auto"]}
                            fill="rgba(128,128,128,0.5)"
                            stroke={null}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            data={weather}
                            dot={false}
                            stroke="#000"
                            strokeWidth={3}
                        />
                        <XAxis
                            type="number"
                            dataKey="time"
                            domain={[+chartRange[0], +chartRange[1]]}
                            ticks={ticks}
                            scale="time"
                            mirror={true}
                            axisLine={false}
                            allowDataOverflow={true}
                            tickFormatter={formatXaxisTick}
                        />
                        <YAxis
                            dataKey="value"
                            mirror={true}
                            axisLine={false}
                            ticks={temperatureTicks}
                            domain={[
                                () => minTemperature,
                                () => maxTemperature
                            ]}
                            tickFormatter={val => `${val} °C`}
                        />

                        <ReferenceLine y={0} stroke="#000" />
                        <ReferenceLine x={+now.toDate()} stroke="#333" />
                    </ComposedChart>
                    <div className="battery" style={{ width: battery + "%" }} />
                </body>
            </html>
        );
    }
}

module.exports = Cover;
