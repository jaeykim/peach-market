"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daum: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

export type SelectedAddress = {
  address: string;       // 도로명 (또는 지번)
  jibunAddress: string;
  zipcode: string;
  lat: number;
  lng: number;
};

export default function AddressPicker({
  value,
  onChange,
  naverClientId,
}: {
  value: SelectedAddress | null;
  onChange: (a: SelectedAddress) => void;
  naverClientId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    if (document.getElementById("daum-postcode-sdk")) return;
    const s = document.createElement("script");
    s.id = "daum-postcode-sdk";
    s.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Naver Maps SDK + geocoder 로드 (MapView가 이미 로드했으면 재사용)
  useEffect(() => {
    if (!naverClientId) return;
    if (document.getElementById("naver-map-sdk")) return;
    const s = document.createElement("script");
    s.id = "naver-map-sdk";
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}&submodules=geocoder`;
    s.async = true;
    document.head.appendChild(s);
  }, [naverClientId]);

  function openPicker() {
    if (!window.daum?.Postcode) {
      setError("주소 검색 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setError("");
    new window.daum.Postcode({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oncomplete: (data: any) => {
        const roadAddress = data.roadAddress || data.address;
        const jibun = data.jibunAddress || data.autoJibunAddress || "";
        const zip = data.zonecode || "";
        // 주소를 좌표로 변환
        geocode(roadAddress, jibun, zip);
      },
    }).open();
  }

  function geocode(address: string, jibunAddress: string, zipcode: string) {
    if (!window.naver?.maps?.Service) {
      // 지오코더 모듈이 아직 안 떴거나 인증 실패. 일단 좌표 없이 저장.
      setError("좌표 변환 모듈을 불러오지 못했습니다. (네이버 지도 인증 확인 필요)");
      onChange({ address, jibunAddress, zipcode, lat: 37.5665, lng: 126.978 });
      return;
    }
    setLoading(true);
    window.naver.maps.Service.geocode(
      { query: address },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (status: any, response: any) => {
        setLoading(false);
        if (status !== window.naver.maps.Service.Status.OK) {
          setError("좌표 변환 실패");
          return;
        }
        const items = response?.v2?.addresses;
        if (!items || items.length === 0) {
          setError("좌표를 찾을 수 없습니다");
          return;
        }
        const item = items[0];
        onChange({
          address,
          jibunAddress,
          zipcode,
          lat: parseFloat(item.y),
          lng: parseFloat(item.x),
        });
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPicker}
        className="w-full text-left border-2 border-dashed border-pink-300 rounded-lg p-3 hover:bg-pink-50 transition"
      >
        {value ? (
          <div>
            <div className="text-xs text-pink-600 font-semibold">
              📍 선택된 주소 (클릭하여 변경)
            </div>
            <div className="text-sm font-semibold mt-1">{value.address}</div>
            {value.jibunAddress && (
              <div className="text-xs text-neutral-500">{value.jibunAddress}</div>
            )}
            <div className="text-[11px] text-neutral-400 mt-0.5">
              우편번호 {value.zipcode} · 좌표 {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </div>
          </div>
        ) : (
          <div className="text-center text-neutral-500 py-2">
            🔍 <span className="font-semibold text-pink-600">주소 검색</span>
            <div className="text-xs mt-0.5">도로명/지번/건물명으로 검색</div>
          </div>
        )}
      </button>
      {loading && <p className="text-xs text-neutral-500 mt-1">좌표 변환 중...</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
