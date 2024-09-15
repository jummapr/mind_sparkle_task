class ApiResponse {
    public success: boolean;
    public message: string;
    public data: any;
    public statusCode: number;


    constructor(
        statusCode: number,
        message="Success",
        data?: any
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
    }
}

export default ApiResponse;