class TrendState {
	static GroupBy = "none"
    static Chart=null
}
function GaussKDE(xi, x, std) {
	return (1 / (Math.sqrt(2 * Math.PI) * std)) * Math.exp(Math.pow((xi - x) / std, 2) / -2)
}
const DAY = 1000 * 3600 * 24
const IMPORTANCE_POW=1.5
const BANDWIDTH_MUL=7
const PADDING_MUL = 2
const MAX_SAMPLES=200
function getSampleDates() {
	const sortedData = DB.data.filter((item) => !item.isPeriod).toSorted((a, b) => getMidTime(b) - getMidTime(a))
	const maxItem = sortedData[0]
	const minItem = sortedData[sortedData.length - 1]
	const maxtime = getMidTime(maxItem)
	const mintime = getMidTime(minItem)
	const span = maxtime - mintime
	const interval = Math.max(DAY, Math.floor(span / MAX_SAMPLES)) //in MS
	const padding = interval * PADDING_MUL
	let dates = []
	for (let timeMS = mintime - padding; timeMS < maxtime + padding; timeMS += interval) {
		//skip duplicate date
		if (dates.length > 0 && dates[dates.length - 1] == timeMS) continue
		dates.push(timeMS)
	}
	return [dates, interval]
}

function getValues() {
	const [dates, interval] = getSampleDates()
	let data = dates.map((d) => {
		return { date: new Date(d).getTime() }
	})
	let inputData = DB.data.filter((item) => !item.isPeriod)
	let series = []
	if (TrendState.GroupBy === "none") {
		populateSeries(dates, data, inputData, "value", interval)
		series.push({
			name: "Interest",
			key: "value",
			color: 4,
		})
	} else if (TrendState.GroupBy === "tag") {
		for (const [tagid,tagObj] of DB.tags.entries()) {
            let filtered=inputData.filter(data=>data.tags.has(tagid))
            if(filtered.length===0) continue
            populateSeries(dates, data,filtered , tagid, interval)

            series.push({
                name: tagObj.name,
                key: tagid,
                color: tagObj.color,
            })
		}
	} else if (TrendState.GroupBy === "color") {
		for (let i = 0; i < COLORS_MID.length; ++i) {
            let filtered=inputData.filter(data=>data.color===String(i))
            
            if(filtered.length===0) continue
            populateSeries(dates, data, filtered, String(i), interval)
            series.push({
                name: "group"+i,
                key: String(i),
                color: i,
            })
        }
	}
	return [data, series]
}

function populateSeries(times, outputData, inputData, key, interval) {
	for (let i = 0; i < outputData.length; ++i) {
		if (!outputData[i]) continue
		const timeMS = times[i]
		for (let j = 0; j < inputData.length; ++j) {
			let kval = GaussKDE(timeMS, getMidTime(inputData[j]), interval * BANDWIDTH_MUL) * inputData[j].importance ** IMPORTANCE_POW

			if (!outputData[i][key]) outputData[i][key] = kval
			else outputData[i][key] += kval
		}
	}
}

//상위 10% or 상위 N개



async function TrendView() {
	DB.view = VIEW.Trend
	await DatabaseStub.loadData()
    if(TrendState.Chart) TrendState.Chart.dispose()
	const root = am5.Root.new("trend-chartdiv")
	const chart = root.container.children.push(
		am5xy.XYChart.new(root, {
			panY: false,
			wheelY: "zoomX",
			layout: root.verticalLayout,
			maxTooltipDistance: 0,
		})
	)
    TrendState.Chart=root

	var [data, seriesInfo] = getValues()
        
	var yRenderer = am5xy.AxisRendererY.new(root, {})
	yRenderer.labels.template.set("visible", false)

	const yAxis = chart.yAxes.push(
		am5xy.ValueAxis.new(root, {
			extraTooltipPrecision: 1,
			renderer: yRenderer,
		})
	)
	const xAxis = chart.xAxes.push(
		am5xy.DateAxis.new(root, {
			baseInterval: { timeUnit: "day", count: 1 },
			renderer: am5xy.AxisRendererX.new(root, {
				minGridDistance: 50,
			}),
		})
	)

	function createSeries(name, field, color) {
		const series = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: name,
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: field,
				valueXField: "date",
				tooltip: am5.Tooltip.new(root, {}),
				legendLabelText: "{name}",
				legendRangeLabelText: "{name}",
				fill: am5.color(COLORS_MID[Number(color)]),
				stroke: am5.color(COLORS_MID[Number(color)]),
			})
		)

		/*
        series.bullets.push(function(){
            am5.Bullet.new(root, {
                locationY: 0.1,
                sprite: am5.Circle.new(root, {
                    radius: 4,
                    strokeWidth: 2,
                    fill: series.get("fill")
                })
            })
        });*/

		series.strokes.template.set("strokeWidth", 2)
		series.data.setAll(data)
	}
	for (const se of seriesInfo) {
		createSeries(se.name, se.key, se.color)
	}

	let legend = chart.children.push(am5.Legend.new(root, {}))
	legend.data.setAll(chart.series.values)
	xAxis.set(
		"tooltip",
		am5.Tooltip.new(root, {
			themeTags: ["axis"],
		})
	)

	yAxis.set(
		"tooltip",
		am5.Tooltip.new(root, {
			themeTags: ["axis"],
		})
	)
}
