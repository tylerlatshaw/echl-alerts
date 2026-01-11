import DefaultThemeSetter from "../../components/global-components/default-theme-setter";
import SubscribeForm from "../../components/subscribe/subscribe-form";

export default async function Page() {
    return (
        <>
            <DefaultThemeSetter />
            <div className="mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Subscribe to Transaction Alerts</h1>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <SubscribeForm />
                </div>
            </div>
        </>
    );
}