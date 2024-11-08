import { Img, Section, Text } from "@react-email/components";
export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Img
        src="/static/ville.png"
        alt="VilleDishes Logo"
        width={50}
        height={50}
        style={image}
      />
      <Text style={textStyle}>VilleDishes</Text>
    </Section>
  );
};

const header = {
  backgroundColor: "#4a5568",
  color: "white",
  padding: "20px",
  textAlign: "center" as const,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
  borderBottom: "1px solid #e1e1e1",
};

const image = { display: "flex", margin: "0 auto" };

const textStyle = { fontSize: "24px", fontWeight: "bold", marginTop: "10px" };
