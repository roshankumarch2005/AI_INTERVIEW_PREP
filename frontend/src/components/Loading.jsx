import React from "react";
import { ImSpinner8 } from "react-icons/im";

const Loading = ({ size = "md", text = "Loading..." }) => {
    const sizeClasses = {
        sm: "text-2xl",
        md: "text-4xl",
        lg: "text-6xl",
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <ImSpinner8 className={`${sizeClasses[size]} text-orange-600 animate-spin`} />
            {text && <p className="mt-4 text-gray-600">{text}</p>}
        </div>
    );
};

export default Loading;
