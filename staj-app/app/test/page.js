"use client"

import { useState } from "react";

const TestPage = () => {
    // Input başlangıç değerlerini string yapıyoruz ki kullanıcı rahatça silsin/yazsın
    const [sayi1Data, setSayi1Data] = useState("");
    const [sayi2Data, setSayi2Data] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const [result, setResult] = useState(0); // Sonuç başlangıçta 0 olsun

    const yazdir = () => {
        // Number() kullanarak metinleri sayıya çeviriyoruz
        const hesapla = Number(sayi1Data) + Number(sayi2Data);
        setResult(hesapla);
        setIsVisible(!isVisible);
    }

    return (
        <>
            {!isVisible ? <><input
                id="1"
                type="number" // Sadece sayı girilmesini sağlamak için iyi bir pratik
                onChange={(e) => setSayi1Data(e.target.value)}
                value={sayi1Data}
            />
                <input
                    id="2"
                    type="number"
                    onChange={(e) => setSayi2Data(e.target.value)}
                    value={sayi2Data}
                />
                <button onClick={yazdir}>yazdır</button></> : <>   <button onClick={() => setIsVisible(!isVisible)}>Tekrar Dene</button></>}
           
           
            {/* {isVisible && (

                <>
                    <input
                        id="1"
                        type="number" // Sadece sayı girilmesini sağlamak için iyi bir pratik
                        onChange={(e) => setSayi1Data(e.target.value)}
                        value={sayi1Data}
                    />
                    <input
                        id="2"
                        type="number"
                        onChange={(e) => setSayi2Data(e.target.value)}
                        value={sayi2Data}
                    />
                    <button onClick={yazdir}>yazdır</button>

                </>
            )} */}

            <div>
                Sonuç: {result}
            </div>
        </>
    );
}

export default TestPage;