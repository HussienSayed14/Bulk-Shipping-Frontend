import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBatchStore } from "../../store/batchStore";
import { batchesApi } from "../../api/endpoints";
import { getErrorMessage } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  ArrowLeft,
  PartyPopper,
  FileText,
  Printer,
  Package,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { LabelSize } from "../../types";
import toast from "react-hot-toast";

export default function Purchase() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { batch, loadBatch, shipments, loadShipments } = useBatchStore();
  const { refreshUser, user } = useAuthStore();

  const [labelSize, setLabelSize] = useState<LabelSize>("4x6");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    total_labels: number;
    total_cost: number;
    new_balance: number;
    label_size: string;
  } | null>(null);

  const id = Number(batchId);

  const load = useCallback(async () => {
    try {
      await Promise.all([loadBatch(id), loadShipments(id)]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [id, loadBatch, loadShipments]);

  useEffect(() => {
    load();
  }, [load]);

  const totalCost = shipments.reduce(
    (sum, s) => sum + (Number(s.shipping_cost) || 0),
    0,
  );
  const validCount = shipments.filter(
    (s) => s.is_valid && s.shipping_service,
  ).length;
  const balance = user?.profile?.balance || 0;
  const canAfford = balance >= totalCost;

  const handlePurchase = async () => {
    if (!acceptTerms) {
      toast.error("Please accept the terms");
      return;
    }
    if (!canAfford) {
      toast.error("Insufficient balance");
      return;
    }
    setPurchasing(true);
    try {
      const r = await batchesApi.purchase(id, {
        label_size: labelSize,
        accept_terms: true,
      });
      setResult(r);
      await refreshUser();
      toast.success("Purchase successful!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  if (!batch && !result)
    return <LoadingSpinner fullScreen message="Loading..." />;

  // ── Success screen ──
  if (result) {
    return (
      <div className="page-enter max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl border shadow-sm p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-scale-in">
            <PartyPopper className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Purchase Complete!
            </h1>
            <p className="text-gray-500 mt-2">{result.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Labels Created</p>
              <p className="text-xl font-bold">{result.total_labels}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Total Charged</p>
              <p className="text-xl font-bold text-red-600">
                -${result.total_cost.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Label Size</p>
              <p className="text-xl font-bold">{result.label_size}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">New Balance</p>
              <p className="text-xl font-bold text-emerald-600">
                ${Number(result.new_balance ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/orders")}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              View Orders
            </Button>
            <Button className="flex-1" onClick={() => navigate("/upload")}>
              <Package className="h-4 w-4 mr-1.5" />
              New Shipment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout screen ──
  return (
    <div className="page-enter max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Purchase Labels
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your order and confirm
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/shipping/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Order summary */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File</span>
              <span className="font-medium">{batch?.file_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Labels</span>
              <span className="font-medium">{validCount} labels</span>
            </div>
            {batch && batch.invalid_records > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Excluded (invalid)</span>
                <span className="text-red-600">
                  {batch.invalid_records} records
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total Cost</span>
              <span className="text-xl font-bold text-gray-900">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Label size picker */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Label Size
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: "4x6" as LabelSize,
                label: "4×6 Thermal",
                desc: "Standard thermal printer labels",
                icon: Printer,
              },
              {
                value: "letter" as LabelSize,
                label: "Letter / A4",
                desc: "Print on regular paper",
                icon: FileText,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setLabelSize(opt.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    labelSize === opt.value
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 mb-2",
                      labelSize === opt.value
                        ? "text-brand-600"
                        : "text-gray-400",
                    )}
                  />
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance check */}
        <div
          className={cn(
            "rounded-xl border p-6",
            canAfford
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Account Balance
              </p>
              <p className="text-2xl font-bold mt-1">
                {" "}
                ${Number(balance ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">After Purchase</p>
              <p
                className={cn(
                  "text-2xl font-bold mt-1",
                  canAfford ? "text-emerald-600" : "text-red-600",
                )}
              >
                ${(balance - totalCost).toFixed(2)}
              </p>
            </div>
          </div>
          {!canAfford && (
            <div className="mt-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              Insufficient balance. You need ${(totalCost - balance).toFixed(
                2,
              )}{" "}
              more.
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="bg-white rounded-xl border p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                I confirm this purchase
              </p>
              <p className="text-xs text-gray-500 mt-1">
                I understand that ${totalCost.toFixed(2)} will be deducted from
                my account balance for {validCount} shipping labels (
                {labelSize === "4x6" ? "4×6 thermal" : "letter"} format).
              </p>
            </div>
          </label>
        </div>

        {/* Purchase button */}
        <Button
          onClick={handlePurchase}
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-base"
          disabled={!acceptTerms || !canAfford || purchasing}
          isLoading={purchasing}
        >
          <ShieldCheck className="h-5 w-5 mr-2" />
          {purchasing
            ? "Processing..."
            : `Purchase ${validCount} Labels — $${totalCost.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
