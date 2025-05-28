export const buttonStyles = {
  actionButton: "px-4 py-2 rounded-md bg-[#1a1a1a] text-white font-medium transition-all duration-200 hover:opacity-80",
  editButton: "px-4 py-2 rounded-md bg-[#1a1a1a] text-[#4DA8DA] font-medium transition-all duration-200 hover:opacity-80",
  deleteButton: "px-4 py-2 rounded-md bg-[#1a1a1a] text-red-500 font-medium transition-all duration-200 hover:opacity-80",
  statusButton: {
    base: "px-4 py-2 rounded-md font-medium transition-all duration-200",
    confirmed: "bg-[#1a1a1a] text-green-500 hover:opacity-80",
    pending: "bg-[#1a1a1a] text-yellow-500 hover:opacity-80",
    cancelled: "bg-[#1a1a1a] text-red-500 hover:opacity-80",
    active: "ring-2 ring-offset-2"
  }
};