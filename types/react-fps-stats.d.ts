declare module 'react-fps-stats' {
    import { FC } from 'react'

    interface FPSStatsProps {
        top?: string | number
        right?: string | number
        bottom?: string | number
        left?: string | number
        graphHeight?: string | number
        graphWidth?: string | number
    }

    const FPSStats: FC<FPSStatsProps>
    export default FPSStats
}
