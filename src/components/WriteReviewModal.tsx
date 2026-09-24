import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { PropFirm, FirmReview } from '../types';
import { UserProfileData, addReviewToFirestore } from '../lib/firebase';

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
  const [payoutReceived, setPayoutReceived] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('4250');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('Rapid payout processing, zero slippage');
  const [cons, setCons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        await addReviewToFirestore(userProfile.uid, firm.id, newReview);
      }
    } catch (err) {
      console.error('Error saving review to Firestore:', err);
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
      <div className="bg-[#131629] border border-purple-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Write Review for {firm.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +50 LP Reward
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Share your genuine trading and payout experience.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Review Submitted!</h4>
            <p className="text-xs text-emerald-300 font-semibold">+50 Loyalty Points credited to your account.</p>
            <p className="text-xs text-slate-400">Thank you for helping other prop traders verify this firm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Rating Stars */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Star Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
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
                <label className="text-slate-300 font-semibold block mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex M."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Title & Comment */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Review Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Smooth evaluation pass & 24hr payout received"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Detailed Experience</label>
              <textarea
                required
                rows={3}
                placeholder="Describe rule execution, slippage, payout approval, customer service..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              ></textarea>
            </div>

            {/* Payout Received checkbox & amount */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payoutReceived}
                  onChange={(e) => setPayoutReceived(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                />
                <span className="font-semibold text-white">I have received a verified payout from this firm</span>
              </label>

              {payoutReceived && (
                <div className="pt-2">
                  <label className="text-slate-300 block mb-1">Payout Amount ($ USD)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Review...' : 'Publish Verified Review (+50 LP)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
