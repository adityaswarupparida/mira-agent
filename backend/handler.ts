import prisma from "./db";

const delay = 5 * 60 * 1000 // 1 min

const promisifiedSetTimeout = async (delay: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export const asyncHandleHelpRequestTimeout = async (id: number) => {
    await promisifiedSetTimeout(delay);
    const help_request = await prisma.help_requests.findUnique({
        where: { id }
    });

    if (help_request?.status == "Pending") {
        await prisma.help_requests.update({
            where: { id },
            data: {
                status: "Unresolved"
            }
        })
    }
}