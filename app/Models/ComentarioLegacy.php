<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComentarioLegacy extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'comentarios_legacy';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'lead_id',
        'comentario',
        'created',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created' => 'datetime',
        'lead_id' => 'integer',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set created date if not provided
        static::creating(function ($model) {
            if (empty($model->created)) {
                $model->created = now();
            }
        });
    }

    /**
     * Get the lead that owns the legacy comment.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Scope a query to only include comments for a specific lead.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $leadId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePorLead($query, int $leadId)
    {
        return $query->where('lead_id', $leadId);
    }

    /**
     * Scope a query to order comments by creation date.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $order
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOrdenarPorFecha($query, string $order = 'desc')
    {
        return $query->orderBy('created', $order);
    }

    /**
     * Scope a query to only include comments created after a specific date.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|\Carbon\Carbon $date
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCreadosDespuesDe($query, $date)
    {
        return $query->where('created', '>=', $date);
    }

    /**
     * Scope a query to only include comments created before a specific date.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|\Carbon\Carbon $date
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCreadosAntesDe($query, $date)
    {
        return $query->where('created', '<=', $date);
    }

    /**
     * Get a preview of the comment (truncated if too long).
     *
     * @param int $length
     * @return string
     */
    public function getPreviewAttribute(int $length = 100): string
    {
        if (strlen($this->comentario) <= $length) {
            return $this->comentario;
        }

        return substr($this->comentario, 0, $length) . '...';
    }

    /**
     * Check if the comment is empty.
     *
     * @return bool
     */
    public function getEstaVacioAttribute(): bool
    {
        return empty(trim($this->comentario));
    }

    /**
     * Get the word count of the comment.
     *
     * @return int
     */
    public function getConteoPalabrasAttribute(): int
    {
        return str_word_count($this->comentario);
    }

    /**
     * Get the comment date in a formatted string.
     *
     * @return string
     */
    public function getFechaFormateadaAttribute(): string
    {
        return $this->created->format('d/m/Y H:i:s');
    }

    /**
     * Get the comment date in a human readable format.
     *
     * @return string
     */
    public function getFechaLegibleAttribute(): string
    {
        return $this->created->diffForHumans();
    }
}