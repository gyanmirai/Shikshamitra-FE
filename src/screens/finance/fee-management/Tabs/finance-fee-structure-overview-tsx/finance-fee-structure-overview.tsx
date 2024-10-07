import { Box } from '@mui/material'
import React from 'react'
import FinanceFeeStructureOverviewComponent from './component/finance-fee-structure-overview-component'
import FinanceCreateFeeStructureComponent from './component/finance-create-fee-structure'
// import FinanceFeeTrackingComponent from './component/finance-fee-tracking'
import FinanceFeeListOverviewComponent from './component/finance-fee-list-overview'

const FinanceFeeStructureOverview = () => {
    return (
        <Box>
            <FinanceFeeStructureOverviewComponent/>
            <FinanceCreateFeeStructureComponent/>
            {/* <FinanceFeeTrackingComponent /> */}
            <FinanceFeeListOverviewComponent />


        </Box>
    )
}

export default FinanceFeeStructureOverview