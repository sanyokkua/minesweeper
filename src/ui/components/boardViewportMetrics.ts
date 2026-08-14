export type BoardEdgeVisibility = { top: boolean; right: boolean; bottom: boolean; left: boolean }

export type BoardViewportMetrics = {
    scrollTop: number
    scrollLeft: number
    clientWidth: number
    clientHeight: number
    scrollWidth: number
    scrollHeight: number
}

export function getBoardEdgeVisibility(metrics: BoardViewportMetrics): BoardEdgeVisibility {
    return {
        top: metrics.scrollTop > 1,
        right: metrics.scrollLeft + metrics.clientWidth < metrics.scrollWidth - 1,
        bottom: metrics.scrollTop + metrics.clientHeight < metrics.scrollHeight - 1,
        left: metrics.scrollLeft > 1,
    }
}
