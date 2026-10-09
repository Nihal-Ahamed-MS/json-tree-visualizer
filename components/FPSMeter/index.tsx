"use client"

import FPSStats from 'react-fps-stats'
import { FPS_STATS } from './constants'

// react-fps-stats positions itself with `position: fixed`, so this pins it to the window's top-right
const FpsMeter = () => <FPSStats top={FPS_STATS.OFFSET} right={FPS_STATS.OFFSET} left="auto" />

export default FpsMeter
