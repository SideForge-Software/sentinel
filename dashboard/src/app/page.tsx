import Image from "../../node_modules/next/image";

export default function Home() {
  return (
    <div className="coming-soon">

      <Image src="https://cdn.sideforge.io/sentinel/Logo_Single_1.png" height="100" width="100" alt="Logo"/>

      <h1>Coming Soon!</h1>
      <p>This product is coming soon, thanks for your patience.</p>

    </div>
  );
}
