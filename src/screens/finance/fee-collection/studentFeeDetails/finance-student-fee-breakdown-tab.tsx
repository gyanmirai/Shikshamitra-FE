import React from 'react'

import CustomizableTable from 'src/components/customizabaleTable';

const FinanceStudentFeeBreakdownTab = () => {
    const data = [
        {
            id: 1,
            date: "25-12-2024",
            type: "Tution Fees",
            amount: '500'
        },
        {
            id: 2,
            date: "25-12-2024",
            type: "Tution Fees",
            amount: '500'
        },
        {
            id: 3,
            date: "25-12-2024",
            type: "Tution Fees",
            amount: '500'
        },

    ];
    return (

        <CustomizableTable
            columns={[
                { id: 'date', label: 'Date' },
                { id: 'type', label: 'Type' },
                { id: 'amount', label: 'Amount' },
            ]}
            data={data}
        />


    )
}

export default FinanceStudentFeeBreakdownTab