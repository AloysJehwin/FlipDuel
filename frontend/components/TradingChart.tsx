'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, AreaSeries, createSeriesMarkers } from 'lightweight-charts'

interface Trade {
  time: number
  price: number
  action: 'buy' | 'sell'
  amount: number
}

interface TradingChartProps {
  data: Array<{ time: number; price: number }>
  trades?: Trade[]
  currentPrice?: number
  tokenSymbol?: string
}

export default function TradingChart({ data, trades = [], currentPrice, tokenSymbol = 'TOKEN' }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#e0e0e0',
      },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2a2a2a',
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
      },
      crosshair: {
        mode: 0,
      },
    })

    // Add area series using new API
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#ff3366',
      topColor: 'rgba(255, 51, 102, 0.4)',
      bottomColor: 'rgba(255, 51, 102, 0.0)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    // Format data for chart
    const chartData = data.map(d => ({
      time: Math.floor(d.time / 1000),
      value: d.price
    }))

    areaSeries.setData(chartData)

    // Add markers for trades
    if (trades.length > 0) {
      const markers = trades.map(trade => {
        const timestamp = Math.floor(trade.time / 1000)
        const date = new Date(timestamp * 1000)

        return {
          time: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
          },
          position: trade.action === 'buy' ? 'belowBar' : 'aboveBar',
          color: trade.action === 'buy' ? '#26a69a' : '#ef5350',
          shape: trade.action === 'buy' ? 'arrowUp' : 'arrowDown',
          text: trade.amount.toFixed(3),
        }
      })

      createSeriesMarkers(areaSeries, markers)
    }

    // Fit content
    chart.timeScale().fitContent()

    chartRef.current = chart
    seriesRef.current = areaSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, trades])

  // Update current price
  useEffect(() => {
    if (currentPrice && seriesRef.current && data.length > 0) {
      const latestTime = Math.floor(data[data.length - 1].time / 1000)
      seriesRef.current.update({
        time: latestTime,
        value: currentPrice
      })
    }
  }, [currentPrice, data])

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden border-2 border-accent-gray" />
      {currentPrice && (
        <div className="absolute top-4 left-4 bg-surface/90 px-4 py-2 rounded-lg border-2 border-accent-gray">
          <div className="text-xs text-text-muted uppercase">Current Price</div>
          <div className="text-2xl font-retro text-retro-cherry">
            ${currentPrice.toFixed(2)}
          </div>
          <div className="text-xs text-text-muted">{tokenSymbol}</div>
        </div>
      )}
    </div>
  )
}
