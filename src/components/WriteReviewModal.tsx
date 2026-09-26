import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { PropFirm, FirmReview } from '../types';
import { UserProfileData, addReview } from '../lib/api';

interface WriteReviewModalProps {
  firm: PropFirm | null;
  userProfile?: UserProfileData | null;
  onClose: () => void;
  onSubmitReview: (firmId: string, review: FirmReview) => void;
  onRewardPoints?: (points: number) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  firm,
  userProfile,
  onClose,
  onSubmitReview,
  onRewardPoints,
}) => {
  const [author, setAuthor] = useState(userProfile?.displayName || '');
  const [country, setCountry] = useState('United States');
  const [rating, setRating] = useState(5);
  const [accountType, setAccountType] = useState('$100K Combine / Evaluation');
  const [payoutReceived, setPayoutReceived] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!firm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [firm, onClose]);

  if (!firm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !title.trim()) return;

    if (!userProfile) { setError('Sign in before submitting a review.'); return; }
    setError('');
    setIsSubmitting(true);
    const newReview: FirmReview = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      country: country.trim() || 'United States',
      rating,
      date: 'Just now',
      accountType,
      payoutReceived,
      payoutAmount: payoutReceived ? parseFloat(payoutAmount) || 0 : undefined,
      title: title.trim(),
      comment: comment.trim(),
      pros: pros ? pros.split(',').map((p) => p.trim()).filter(Boolean) : [],
      cons: cons ? cons.split(',').map((c) => c.trim()).filter(Boolean) : [],
    };

    try {
      if (userProfile?.uid) {
        newReview.id = await addReview(userProfile.uid, firm.id, newReview);
      }
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
      return;
    }

    onSubmitReview(firm.id, newReview);
    if (onRewardPoints) {
      onRewardPoints(50);
    }
    setSubmitted(true);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1d1f1e] border border-emerald-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        <div className="flex items-center justify-between border-b border-[#2b2e2c] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#f1f3f2] text-base">Write Review for {firm.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +50 LP Reward
              </span>
            </div>
            <p className="text-xs text-[#747976] mt-0.5">Share your genuine trading and payout experience.</p>
          </div>
          <button onClick={onClose} className="text-[#747976] hover:text-[#f1f3f2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#3ecf8e] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Review Submitted!</h4>
            <p className="text-xs text-[#3ecf8e] font-semibold">+50 Loyalty Points credited to your account.</p>
            <p className="text-xs text-[#747976]">Thank you for helping other prop traders verify this firm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Rating Stars */}
            <div className="space-y-1">
              <label className="text-[#9a9e9b] font-semibold block">Star Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors duration-150"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">{rating}.0 / 5.0</span>
              </div>
            </div>

            {/* Author & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#9a9e9b] font-semibold block mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex M."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#1d1f1e] border border-[#333633] rounded-lg px-3 py-2 text-[#f1f3f2]"
                />
              </div>
              <div>
                <label className="text-[#9a9e9b] font-semibold block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#1d1f1e] border border-[#333633] rounded-lg px-3 py-2 text-[#f1f3f2]"
                />
              </div>
            </div>

            {/* Title & Comment */}
            <div>
              <label className="text-[#9a9e9b] font-semibold block mb-1">Review Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Smooth evaluation pass & 24hr payout received"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1d1f1e] border border-[#333633] rounded-lg px-3 py-2 text-[#f1f3f2]"
              />
            </div>

            <div>
              <label className="text-[#9a9e9b] font-semibold block mb-1">Detailed Experience</label>
              <textarea
                required
                rows={3}
                placeholder="Describe rule execution, slippage, payout approval, customer service..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#1d1f1e] border border-[#333633] rounded-lg px-3 py-2 text-[#f1f3f2]"
              ></textarea>
            </div>

            {/* Payout Received checkbox & amount */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payoutReceived}
                  onChange={(e) => setPayoutReceived(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-[#f1f3f2]">I have received a verified payout from this firm</span>
              </label>

              {payoutReceived && (
                <div className="pt-2">
                  <label className="text-[#9a9e9b] block mb-1">Payout Amount ($ USD)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-[#1d1f1e] border border-[#333633] rounded-lg px-3 py-1.5 text-[#f1f3f2]"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Review...' : 'Publish Verified Review (+50 LP)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
