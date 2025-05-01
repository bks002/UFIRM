const API_URL = 'https://api.urest.in:8096/';
//const API_URL = 'http://localhost:62929/';
export  const ticketIntimation = async (smsModel) => {
    try {
        const response = await fetch(`${API_URL}api/sms/TicketIntimation`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(smsModel),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error sending sms intimation:', error);
        throw error;
    }
};