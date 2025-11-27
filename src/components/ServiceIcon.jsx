import { Claude, OpenAI, Gemini } from "@lobehub/icons";

export const ServiceIcon = ({ name, size }) => {
    if (name === 'Claude') return <Claude size={size} />;
    if (name === 'OpenAI') return <OpenAI size={size} />;
    if (name === 'Gemini') return <Gemini size={size} />;
    return null;
};
