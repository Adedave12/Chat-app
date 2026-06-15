const uploadFile = async (file) => {
  try {
    // Get cloud name from environment variable or use a fallback
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "degio18pg";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat-app-file");
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    return { ...responseData, url: responseData.secure_url || responseData.url };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export default uploadFile;